/**
 * AI-Powered Schedule Generator
 * Generates conflict-free course schedules using constraint satisfaction
 */

const Section = require("../models/Section");
const Course = require("../models/course.model");
const Room = require("../models/room.model");
const User = require("../models/User");

// Time slots configuration (can be customized)
const TIME_SLOTS = [
  { start: "08:00", end: "09:00", label: "8:00 AM - 9:00 AM" },
  { start: "09:00", end: "10:00", label: "9:00 AM - 10:00 AM" },
  { start: "10:00", end: "11:00", label: "10:00 AM - 11:00 AM" },
  { start: "11:00", end: "12:00", label: "11:00 AM - 12:00 PM" },
  { start: "12:00", end: "13:00", label: "12:00 PM - 1:00 PM" },
  { start: "13:00", end: "14:00", label: "1:00 PM - 2:00 PM" },
  { start: "14:00", end: "15:00", label: "2:00 PM - 3:00 PM" },
  { start: "15:00", end: "16:00", label: "3:00 PM - 4:00 PM" },
  { start: "16:00", end: "17:00", label: "4:00 PM - 5:00 PM" },
  { start: "17:00", end: "18:00", label: "5:00 PM - 6:00 PM" },
  { start: "18:00", end: "19:00", label: "6:00 PM - 7:00 PM" },
  { start: "19:00", end: "20:00", label: "7:00 PM - 8:00 PM" },
];

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

/**
 * Check if two time slots conflict
 */
function timeSlotsConflict(slot1, slot2) {
  const start1 = timeToMinutes(slot1.start);
  const end1 = timeToMinutes(slot1.end);
  const start2 = timeToMinutes(slot2.start);
  const end2 = timeToMinutes(slot2.end);

  return start1 < end2 && end1 > start2;
}

/**
 * Convert time string to minutes
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if a section assignment is valid (no conflicts)
 */
function isValidAssignment(assignment, existingAssignments) {
  const { instructor, room, day, timeSlot } = assignment;

  for (const existing of existingAssignments) {
    // Same day check
    if (existing.day !== day) continue;

    // Check instructor conflict
    if (
      existing.instructor.toString() === instructor.toString() &&
      timeSlotsConflict(timeSlot, existing.timeSlot)
    ) {
      return {
        valid: false,
        reason: "Instructor has another class at this time",
      };
    }

    // Check room conflict
    if (
      existing.room.toString() === room.toString() &&
      timeSlotsConflict(timeSlot, existing.timeSlot)
    ) {
      return { valid: false, reason: "Room is occupied at this time" };
    }
  }

  return { valid: true };
}

/**
 * Calculate a score for a schedule (higher is better)
 */
function calculateScheduleScore(schedule) {
  let score = 100;

  // Penalty for back-to-back classes for same instructor
  const instructorSchedule = {};
  schedule.forEach((section) => {
    const key = `${section.instructor}-${section.day}`;
    if (!instructorSchedule[key]) instructorSchedule[key] = [];
    instructorSchedule[key].push(section);
  });

  Object.values(instructorSchedule).forEach((daySections) => {
    daySections.sort(
      (a, b) =>
        timeToMinutes(a.timeSlot.start) - timeToMinutes(b.timeSlot.start),
    );
    for (let i = 0; i < daySections.length - 1; i++) {
      const gap =
        timeToMinutes(daySections[i + 1].timeSlot.start) -
        timeToMinutes(daySections[i].timeSlot.end);
      if (gap < 15) score -= 5; // Penalty for less than 15 min gap
      if (gap > 180) score -= 3; // Penalty for large gaps
    }
  });

  // Bonus for balanced distribution across days
  const daysUsed = new Set(schedule.map((s) => s.day)).size;
  score += daysUsed * 2;

  return score;
}

/**
 * Generate multiple schedule options using backtracking with randomization
 */
async function generateScheduleOptions(input, numOptions = 3) {
  const {
    courses,
    instructors,
    rooms,
    semester,
    department,
    courseInstructorMap = {},
  } = input;

  const schedules = [];
  const maxAttempts = numOptions * 10; // Try multiple times to get variety

  for (
    let attempt = 0;
    attempt < maxAttempts && schedules.length < numOptions;
    attempt++
  ) {
    const schedule = await generateSingleSchedule(
      courses,
      instructors,
      rooms,
      semester,
      department,
      courseInstructorMap,
    );

    if (schedule && schedule.length > 0) {
      // Check if this schedule is significantly different from existing ones
      const isDifferent = schedules.every(
        (existing) => calculateScheduleDifference(schedule, existing) > 0.3,
      );

      if (isDifferent || schedules.length === 0) {
        schedules.push({
          id: `schedule_${schedules.length + 1}`,
          sections: schedule,
          score: calculateScheduleScore(schedule),
          conflicts: [],
          stats: calculateScheduleStats(schedule),
        });
      }
    }
  }

  // Sort by score (best first)
  schedules.sort((a, b) => b.score - a.score);

  return schedules;
}

/**
 * Generate a single schedule using constraint satisfaction
 */
async function generateSingleSchedule(
  courses,
  instructors,
  rooms,
  semester,
  department,
  courseInstructorMap = {},
) {
  const assignments = [];
  const shuffledCourses = [...courses].sort(() => Math.random() - 0.5);

  for (const course of shuffledCourses) {
    const cid = course._id.toString();

    // Respect courseInstructorMap: only use instructors assigned to this course
    const allowedIds = courseInstructorMap[cid];
    const eligibleInstructors = instructors.filter((inst) => {
      // Must be in the allowed list (if one is defined)
      if (allowedIds && allowedIds.length > 0) {
        if (!allowedIds.includes(inst._id.toString())) return false;
      }
      // Optional department filter
      if (department) {
        const instDeptId =
          inst.department?._id?.toString() || inst.department?.toString();
        if (instDeptId && instDeptId !== department.toString()) return false;
      }
      return true;
    });

    // Filter rooms that match course requirements
    const eligibleRooms = rooms.filter(
      (room) => room.type === course.required_room_type,
    );

    if (eligibleInstructors.length === 0 || eligibleRooms.length === 0) {
      continue; // Skip this course if no resources available
    }

    // Try to find a valid assignment
    let assigned = false;
    const shuffledDays = [...DAYS].sort(() => Math.random() - 0.5);
    const shuffledSlots = [...TIME_SLOTS].sort(() => Math.random() - 0.5);

    for (const day of shuffledDays) {
      if (assigned) break;

      for (const timeSlot of shuffledSlots) {
        if (assigned) break;

        // Try random instructor and room
        const instructor =
          eligibleInstructors[
            Math.floor(Math.random() * eligibleInstructors.length)
          ];
        const room =
          eligibleRooms[Math.floor(Math.random() * eligibleRooms.length)];

        const assignment = {
          course: course._id,
          courseCode: course.code,
          courseTitle: course.title,
          instructor: instructor._id,
          instructorName: instructor.name,
          room: room._id,
          roomName: room.room_name,
          day,
          timeSlot,
          capacity: room.capacity,
          sectionNumber:
            assignments.filter((a) => a.course === course._id).length + 1,
        };

        const validation = isValidAssignment(assignment, assignments);
        if (validation.valid) {
          assignments.push(assignment);
          assigned = true;
        }
      }
    }
  }

  return assignments;
}

/**
 * Calculate difference between two schedules (0 = identical, 1 = completely different)
 */
function calculateScheduleDifference(schedule1, schedule2) {
  if (schedule1.length !== schedule2.length) return 1;

  let differences = 0;
  for (let i = 0; i < schedule1.length; i++) {
    const s1 = schedule1[i];
    const s2 = schedule2[i];

    if (s1.day !== s2.day) differences++;
    if (s1.timeSlot.start !== s2.timeSlot.start) differences++;
    if (s1.instructor !== s2.instructor) differences++;
    if (s1.room !== s2.room) differences++;
  }

  return differences / (schedule1.length * 4);
}

/**
 * Calculate statistics for a schedule
 */
function calculateScheduleStats(schedule) {
  const instructorLoad = {};
  const roomUsage = {};
  const dayDistribution = {};

  schedule.forEach((section) => {
    // Instructor load
    instructorLoad[section.instructorName] =
      (instructorLoad[section.instructorName] || 0) + 1;

    // Room usage
    roomUsage[section.roomName] = (roomUsage[section.roomName] || 0) + 1;

    // Day distribution
    dayDistribution[section.day] = (dayDistribution[section.day] || 0) + 1;
  });

  return {
    totalSections: schedule.length,
    instructorLoad,
    roomUsage,
    dayDistribution,
    averageClassesPerDay: schedule.length / Object.keys(dayDistribution).length,
  };
}

/**
 * Validate a complete schedule for conflicts
 */
function validateSchedule(schedule) {
  const conflicts = [];

  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      const s1 = schedule[i];
      const s2 = schedule[j];

      if (s1.day !== s2.day) continue;

      // Check instructor conflict
      if (
        s1.instructor.toString() === s2.instructor.toString() &&
        timeSlotsConflict(s1.timeSlot, s2.timeSlot)
      ) {
        conflicts.push({
          type: "instructor",
          section1: s1.courseCode,
          section2: s2.courseCode,
          instructor: s1.instructorName,
          day: s1.day,
          time: `${s1.timeSlot.start} - ${s1.timeSlot.end}`,
        });
      }

      // Check room conflict
      if (
        s1.room.toString() === s2.room.toString() &&
        timeSlotsConflict(s1.timeSlot, s2.timeSlot)
      ) {
        conflicts.push({
          type: "room",
          section1: s1.courseCode,
          section2: s2.courseCode,
          room: s1.roomName,
          day: s1.day,
          time: `${s1.timeSlot.start} - ${s1.timeSlot.end}`,
        });
      }
    }
  }

  return conflicts;
}

module.exports = {
  generateScheduleOptions,
  validateSchedule,
  calculateScheduleStats,
  TIME_SLOTS,
  DAYS,
};
