const { GoogleGenerativeAI } = require("@google/generative-ai");
const {
  validateSchedule,
  calculateScheduleStats,
  TIME_SLOTS,
  DAYS,
} = require("./scheduleGenerator");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Build the structured data payload to send to Gemini
 */
function buildScheduleContext(
  courses,
  instructors,
  rooms,
  courseConstraints = {},
  instructorConstraints = {},
  roomConstraints = {},
  courseInstructorMap = {},
) {
  return {
    available_days: DAYS,
    available_time_slots: TIME_SLOTS.map((t) => `${t.start}-${t.end}`),
    courses: courses.map((c) => {
      const cid = c._id.toString();
      const allowedIds = courseInstructorMap[cid];
      // If map provided and non-empty, use it; otherwise all instructors are allowed
      const allowedInstructors =
        allowedIds && allowedIds.length > 0
          ? allowedIds
          : instructors.map((i) => i._id.toString());
      return {
        id: cid,
        code: c.code,
        title: c.title,
        credits: c.credits,
        room_type_required: c.required_room_type,
        expected_enrollment: courseConstraints[cid]?.expectedEnrollment || 200,
        min_hours_per_week: courseConstraints[cid]?.minHoursPerWeek || 6,
        allowed_instructor_ids: allowedInstructors,
      };
    }),
    instructors: instructors.map((i) => {
      const iid = i._id.toString();
      // Courses this instructor is allowed to teach
      const teachableCourses = courses
        .filter((c) => {
          const cid = c._id.toString();
          const allowed = courseInstructorMap[cid];
          return !allowed || allowed.length === 0 || allowed.includes(iid);
        })
        .map((c) => c.code);
      return {
        id: iid,
        name: i.name,
        department: i.department?.name || i.department?.toString() || "General",
        max_hours_per_week: instructorConstraints[iid]?.maxHoursPerWeek || 12,
        unavailable_slots: (instructorConstraints[iid]?.unavailable || []).map(
          (u) => `${u.day} ${u.slot}`,
        ),
        teachable_courses: teachableCourses,
      };
    }),
    rooms: rooms.map((r) => ({
      id: r._id.toString(),
      name: r.room_name,
      type: r.type,
      capacity: r.capacity,
      open_from: roomConstraints[r._id.toString()]?.openFrom || "08:00",
      open_until: roomConstraints[r._id.toString()]?.openUntil || "20:00",
    })),
  };
}

/**
 * The strict system prompt that tells Gemini exactly what to produce
 */
function buildSystemPrompt() {
  return `You are a university schedule generator. Your job is to create conflict-free course schedules.

STRICT RULES — violating any rule makes the schedule invalid:
1. An instructor CANNOT teach two courses at the same day AND time slot.
2. A room CANNOT host two courses at the same day AND time slot.
3. Each course must be assigned a room whose type matches the course's required room type exactly.
4. Use only the provided days, time slots, instructors, and rooms — do not invent new ones.
5. Every course in the input must appear exactly once in each schedule option.
6. An instructor CANNOT be scheduled during their listed unavailable_slots.
7. An instructor's total scheduled hours MUST NOT exceed their max_hours_per_week.
8. A room CANNOT be scheduled outside its open_from and open_until hours.
9. Choose a room whose capacity is >= the course's expected_enrollment when possible.
10. Each course must receive at least min_hours_per_week hours of instruction per week.
11. CRITICAL — Each course has an allowed_instructor_ids list. You MUST only assign an instructor to a course if that instructor's id appears in the course's allowed_instructor_ids list. Assigning an instructor not in that list is a hard violation.
12. CRITICAL — Each instructor has a teachable_courses list (course codes). An instructor MUST NOT be assigned to any course whose code is not in their teachable_courses list.

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown, no explanation, no code blocks:
{
  "schedules": [
    {
      "option": 1,
      "sections": [
        {
          "courseId": "<id>",
          "instructorId": "<id>",
          "roomId": "<id>",
          "day": "<day>",
          "timeSlot": { "start": "HH:MM", "end": "HH:MM" }
        }
      ]
    }
  ]
}`;
}

/**
 * Parse and validate Gemini's JSON response
 */
function parseGeminiResponse(
  text,
  courses,
  instructors,
  rooms,
  courseInstructorMap = {},
) {
  const cleaned = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // إذا فشل، حاول استخراج ما بين أول { وآخر }
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      try {
        parsed = JSON.parse(text.slice(firstBrace, lastBrace + 1));
      } catch (innerError) {
        throw new Error(
          "JSON is incomplete or truncated. Try requesting fewer schedules.",
        );
      }
    } else {
      throw new Error("Invalid JSON structure.");
    }
  }

  if (!parsed.schedules || !Array.isArray(parsed.schedules)) {
    throw new Error("Gemini response missing 'schedules' array");
  }

  // Build lookup maps for validation
  const courseMap = Object.fromEntries(
    courses.map((c) => [c._id.toString(), c]),
  );
  const instructorMap = Object.fromEntries(
    instructors.map((i) => [i._id.toString(), i]),
  );
  const roomMap = Object.fromEntries(rooms.map((r) => [r._id.toString(), r]));

  const result = [];

  for (const sched of parsed.schedules) {
    if (!Array.isArray(sched.sections)) continue;

    const sections = [];
    for (const s of sched.sections) {
      // Validate all IDs exist
      const course = courseMap[s.courseId];
      const instructor = instructorMap[s.instructorId];
      const room = roomMap[s.roomId];

      if (!course || !instructor || !room) continue; // skip bad entries

      // Validate room type matches course requirement
      if (room.type !== course.required_room_type) continue;

      // Validate instructor is allowed to teach this course
      const cid = course._id.toString();
      const iid = instructor._id.toString();
      const allowedIds = courseInstructorMap[cid];
      if (allowedIds && allowedIds.length > 0 && !allowedIds.includes(iid))
        continue;

      // Validate day and time slot
      if (!DAYS.includes(s.day)) continue;
      const validSlot = TIME_SLOTS.find((t) => t.start === s.timeSlot?.start);
      if (!validSlot) continue;

      sections.push({
        course: course._id,
        courseCode: course.code,
        courseTitle: course.title,
        instructor: instructor._id,
        instructorName: instructor.name,
        room: room._id,
        roomName: room.room_name,
        day: s.day,
        timeSlot: { start: validSlot.start, end: validSlot.end },
        capacity: room.capacity,
        sectionNumber:
          sections.filter((x) => x.course.toString() === course._id.toString())
            .length + 1,
      });
    }

    if (sections.length === 0) continue;

    const conflicts = validateSchedule(sections);
    const stats = calculateScheduleStats(sections);

    result.push({
      id: `schedule_${result.length + 1}`,
      sections,
      score: Math.max(0, 100 - conflicts.length * 20),
      conflicts,
      stats,
      source: "gemini",
    });
  }

  return result;
}

/**
 * Main function: send data to Gemini and get schedule options back
 */
async function generateSchedulesWithGemini(
  courses,
  instructors,
  rooms,
  numOptions = 3,
  courseConstraints = {},
  instructorConstraints = {},
  roomConstraints = {},
  courseInstructorMap = {},
) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 65536,
      responseMimeType: "application/json",
    },
    systemInstruction: buildSystemPrompt(),
  });

  const context = buildScheduleContext(
    courses,
    instructors,
    rooms,
    courseConstraints,
    instructorConstraints,
    roomConstraints,
    courseInstructorMap,
  );

  const userPrompt = `Generate ${numOptions} different conflict-free schedule options for the following university data:

${JSON.stringify(context)}

Remember: respond with ONLY the JSON object, no extra text.`;

  const result = await model.generateContent(userPrompt);
  const text = result.response.text();

  console.log("=== GEMINI RAW RESPONSE ===");
  console.log(text);
  console.log("=== END GEMINI RESPONSE ===");

  const schedules = parseGeminiResponse(
    text,
    courses,
    instructors,
    rooms,
    courseInstructorMap,
  );

  if (schedules.length === 0) {
    throw new Error(
      "Gemini could not generate any valid schedules. Try with fewer courses or more resources. Raw response: " +
        text,
    );
  }

  // Sort best first
  schedules.sort((a, b) => b.score - a.score);
  return schedules;
}

module.exports = { generateSchedulesWithGemini };
