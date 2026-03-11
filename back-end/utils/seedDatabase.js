const Permission = require("../models/Permission");
const Role = require("../models/Role");
const User = require("../models/User");
const Department = require("../models/Department");
const Room = require("../models/room.model");
const Semester = require("../models/Semester");
const Course = require("../models/course.model");
const Section = require("../models/Section");

const permissions = [
  { name: "view_users", description: "View all users", category: "users" },

  { name: "create_user", description: "Create new user", category: "users" },

  {
    name: "update_user",

    description: "Update user details",

    category: "users",
  },

  { name: "delete_user", description: "Delete user", category: "users" },

  {
    name: "view_courses",

    description: "View all courses",

    category: "courses",
  },

  {
    name: "create_course",

    description: "Create new course",

    category: "courses",
  },

  {
    name: "update_course",

    description: "Update course details",

    category: "courses",
  },

  { name: "delete_course", description: "Delete course", category: "courses" },

  {
    name: "view_sections",

    description: "View all sections",

    category: "sections",
  },

  {
    name: "create_section",

    description: "Create new section",

    category: "sections",
  },

  {
    name: "update_section",

    description: "Update section details",

    category: "sections",
  },

  {
    name: "delete_section",

    description: "Delete section",

    category: "sections",
  },

  {
    name: "view_enrollments",

    description: "View all enrollments",

    category: "enrollments",
  },

  {
    name: "create_enrollment",

    description: "Enroll student in course",

    category: "enrollments",
  },

  {
    name: "update_enrollment",

    description: "Update enrollment status",

    category: "enrollments",
  },

  {
    name: "delete_enrollment",

    description: "Remove enrollment",

    category: "enrollments",
  },

  {
    name: "manage_waitlist",

    description: "Manage course waitlist",

    category: "enrollments",
  },
  {
    name: "view_registration_slices",
    description: "View registration slices",
    category: "enrollments",
  },
  {
    name: "create_registration_slice",
    description: "Create new registration slice",
    category: "enrollments",
  },
  {
    name: "update_registration_slice",
    description: "Update registration slice",
    category: "enrollments",
  },
  {
    name: "delete_registration_slice",
    description: "Delete registration slice",
    category: "enrollments",
  },

  {
    name: "view_departments",

    description: "View all departments",

    category: "departments",
  },

  {
    name: "create_department",

    description: "Create new department",

    category: "departments",
  },

  {
    name: "update_department",

    description: "Update department details",

    category: "departments",
  },

  {
    name: "delete_department",

    description: "Delete department",

    category: "departments",
  },

  { name: "view_roles", description: "View all roles", category: "roles" },

  {
    name: "manage_roles",

    description: "Manage roles and permissions",

    category: "roles",
  },
  {
    name: "view_grades",
    description: "View student grades",
    category: "grades",
  },
  {
    name: "manage_grades",
    description: "Input and edit grades",
    category: "grades",
  },
  {
    name: "view_attendance",
    description: "View attendance records",
    category: "attendance",
  },
  {
    name: "manage_attendance",
    description: "Take attendance",
    category: "attendance",
  },
  {
    name: "admin_allowed_ids",
    description: "View and manage allowed user IDs for registration",
    category: "admin",
  },
];

const roles = [
  {
    name: "admin",
    description: "Administrator with full access",
  },
  {
    name: "professor",
    description: "Professor can manage sections and view enrollments",
  },
  {
    name: "student",
    description: "Student can view courses and enroll",
  },
];
const seedDatabase = async () => {
  try {
    // 1. Comprehensive Cleanup
    await Permission.deleteMany();
    await Role.deleteMany();
    await User.deleteMany();
    await Department.deleteMany();
    console.log("Existing data cleared...");

    const departments = await Department.insertMany([
      {
        name: "Computer Science",
        code: "CS",
        description: "Faculty of Computing",
      },
      {
        name: "Information Systems",
        code: "IS",
        description: "Faculty of Management",
      },
      {
        name: "Engineering",
        code: "ENG",
        description: "Faculty of Engineering",
      },
    ]);
    console.log(`${departments.length} Departments created`);

    const createdPermissions = await Permission.insertMany(permissions);
    const allPermissionIds = createdPermissions.map((p) => p._id);

    const adminRole = await Role.create({
      name: "admin",
      description: "Administrator with full access",
      permissions: allPermissionIds,
    });

    // Enhanced Professor Permissions
    const professorPermissions = createdPermissions
      .filter((p) =>
        [
          "view_courses",
          "view_sections",
          "create_section",
          "update_section",
          "view_enrollments",
          "manage_waitlist",
          "view_grades",
          "manage_grades",
          "view_attendance",
          "manage_attendance",
          "view_departments",
        ].includes(p.name),
      )
      .map((p) => p._id);

    const professorRole = await Role.create({
      name: "professor",
      description: "Professor can manage sections, grades, and attendance",
      permissions: professorPermissions,
    });

    // Enhanced Student Permissions
    const studentPermissions = createdPermissions
      .filter((p) =>
        [
          "view_courses",
          "view_sections",
          "view_enrollments",
          "create_enrollment",
          "view_grades",
          "view_attendance",
          "view_departments",
        ].includes(p.name),
      )
      .map((p) => p._id);

    const studentRole = await Role.create({
      name: "student",
      description: "Student can view schedules, enroll, and see grades",
      permissions: studentPermissions,
    });

    console.log("Roles (Admin, Professor, Student) created successfully");

    // 4. إنشاء مستخدمين تجريبيين (Seed Users)
    // ملاحظة: الـ firebaseUid يجب أن تكون حقيقية لو ستجرب بالـ Auth أو وهمية للتطوير فقط
    const users = [
      {
        firebaseUid: "admin_test_uid_123",
        name: "Main Admin",
        email: "admin@university.edu",
        role: adminRole._id,
        department: departments[0]._id, // CS
        is_active: true,
      },
      {
        firebaseUid: "professor_test_uid_456",
        name: "Dr. Ahmed Ali",
        email: "ahmed@university.edu",
        role: professorRole._id,
        department: departments[0]._id, // CS
        is_active: true,
      },
      {
        firebaseUid: "student_test_uid_789",
        name: "Omar Khaled",
        email: "omar@student.edu",
        role: studentRole._id,
        department: departments[1]._id, // IS
        is_active: true,
      },
      {
        firebaseUid: "professor_test_uid_002",
        name: "Dr. Sara Mohamed",
        email: "sara@university.edu",
        role: professorRole._id,
        department: departments[0]._id,
        is_active: true,
      },
      {
        firebaseUid: "professor_test_uid_003",
        name: "Dr. Karim Hassan",
        email: "karim@university.edu",
        role: professorRole._id,
        department: departments[0]._id,
        is_active: true,
      },
      {
        firebaseUid: "professor_test_uid_004",
        name: "Dr. Nadia Mahmoud",
        email: "nadia@university.edu",
        role: professorRole._id,
        department: departments[0]._id,
        is_active: true,
      },
    ];

    await User.insertMany(users);
    console.log("Seed users created successfully");

    // 5. Add rooms (only if they don't exist - no removal of existing data)
    const roomsToAdd = [
      { room_number: "A101", type: "Lecture Hall", capacity: 80 },
      { room_number: "A102", type: "Lecture Hall", capacity: 60 },
      { room_number: "A103", type: "Lecture Hall", capacity: 100 },
      { room_number: "B201", type: "Lab", capacity: 30 },
      { room_number: "B202", type: "Lab", capacity: 30 },
      { room_number: "B203", type: "Lab", capacity: 40 },
      { room_number: "C301", type: "Tutorial", capacity: 25 },
      { room_number: "C302", type: "Tutorial", capacity: 25 },
      { room_number: "D401", type: "Lecture Hall", capacity: 120 },
    ];
    for (const room of roomsToAdd) {
      await Room.findOneAndUpdate(
        { room_number: room.room_number },
        { $setOnInsert: room },
        { upsert: true, new: true },
      );
    }
    console.log(`${roomsToAdd.length} Rooms added (existing preserved)`);

    // 6. Add semesters (with course_visibility_levels)
    const semestersToAdd = [
      {
        year: 2024,
        term: "Fall",
        is_active: false,
        start_date: new Date("2024-09-01"),
        end_date: new Date("2024-12-20"),
        add_drop_start: new Date("2024-08-25"),
        add_drop_end: new Date("2024-09-15"),
        course_visibility_levels: "current_only",
      },
      {
        year: 2025,
        term: "Spring",
        is_active: true,
        start_date: new Date("2025-02-01"),
        end_date: new Date("2025-05-25"),
        add_drop_start: new Date("2025-01-25"),
        add_drop_end: new Date("2025-02-15"),
        course_visibility_levels: "current_and_lower",
      },
      {
        year: 2025,
        term: "Fall",
        is_active: false,
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
        add_drop_start: new Date("2025-08-25"),
        add_drop_end: new Date("2025-09-15"),
        course_visibility_levels: "current_only",
      },
    ];
    for (const semester of semestersToAdd) {
      await Semester.findOneAndUpdate(
        { year: semester.year, term: semester.term },
        { $setOnInsert: semester },
        { upsert: true, new: true },
      );
    }
    console.log(
      `${semestersToAdd.length} Semesters added (with course_visibility_levels)`,
    );

    // تحديث الترمات القديمة إن وُجدت لاحتواء الحقل الجديد
    await Semester.updateMany(
      { course_visibility_levels: { $exists: false } },
      { $set: { course_visibility_levels: "current_only" } },
    );

    // 7. إنشاء المقررات: 12 مقرر لكل مستوى (6 ترم أول + 6 ترم ثاني) = 48 مقرر
    await Course.deleteMany({});
    const roomTypes = ["Lecture Hall", "Lab", "Tutorial"];
    const coursesToCreate = [];
    const deptId = departments[0]._id; // CS
    for (let level = 1; level <= 4; level++) {
      for (let n = 1; n <= 12; n++) {
        const code = `CS${level}${String(n).padStart(2, "0")}`;
        const roomType = roomTypes[(n - 1) % 3];
        coursesToCreate.push({
          department_id: deptId,
          code,
          title: `مقرر مستوى ${level} - ${n} ${n <= 6 ? "(ترم أول)" : "(ترم ثاني)"}`,
          credits: [2, 3, 4][(n - 1) % 3],
          level,
          required_room_type: roomType,
          prerequisites_array: [],
          is_activated: true,
        });
      }
    }
    const createdCourses = await Course.insertMany(coursesToCreate);
    console.log(`${createdCourses.length} Courses created (12 per level)`);

    // 8. إنشاء مجموعتين (سكشنز) لكل مقرر في الترم الفعال — الأوقات من السبت للخميس 8 ص–8 م
    await Section.deleteMany({});
    const activeSemester = await Semester.findOne({ is_active: true });
    if (!activeSemester) throw new Error("No active semester for sections");
    const profRole = await Role.findOne({ name: "professor" });
    if (!profRole) throw new Error("Seed: Professor role not found.");
    const professors = await User.find({ role: profRole._id }).lean();
    const rooms = await Room.find().lean();
    if (!professors.length)
      throw new Error(
        "Seed: No professors found. Ensure users are created with professor role.",
      );
    if (!rooms.length)
      throw new Error(
        "Seed: No rooms found. Ensure rooms are upserted before sections.",
      );
    const days = [
      "Saturday",
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
    ];
    const timeSlots = [
      ["08:00", "10:00"],
      ["10:00", "12:00"],
      ["12:00", "14:00"],
      ["14:00", "16:00"],
      ["16:00", "18:00"],
      ["18:00", "20:00"],
    ];
    let slotIndex = 0;
    const sectionsToCreate = [];
    for (const course of createdCourses) {
      const matchingRooms = rooms.filter(
        (r) => r.type === course.required_room_type,
      );
      const roomPool = matchingRooms.length ? matchingRooms : rooms;
      const room1 = roomPool[slotIndex % roomPool.length];
      const room2 = roomPool[(slotIndex + 1) % roomPool.length];
      const [d1, t1] = [
        slotIndex % days.length,
        Math.floor(slotIndex / days.length) % timeSlots.length,
      ];
      const [d2, t2] = [
        (slotIndex + 2) % days.length,
        Math.floor((slotIndex + 2) / days.length) % timeSlots.length,
      ];
      const instructor1 = professors[slotIndex % professors.length];
      const instructor2 = professors[(slotIndex + 1) % professors.length];
      sectionsToCreate.push(
        {
          sectionNumber: 1,
          course_id: course._id,
          semester_id: activeSemester._id,
          instructor_id: (instructor1 || professors[0])._id,
          room_id: (room1 || roomPool[0])._id,
          day: days[d1],
          start_time: timeSlots[t1][0],
          end_time: timeSlots[t1][1],
          capacity: 40,
        },
        {
          sectionNumber: 2,
          course_id: course._id,
          semester_id: activeSemester._id,
          instructor_id: (instructor2 || professors[0])._id,
          room_id: (room2 || roomPool[0])._id,
          day: days[d2],
          start_time: timeSlots[t2][0],
          end_time: timeSlots[t2][1],
          capacity: 40,
        },
      );
      slotIndex += 3;
    }
    await Section.insertMany(sectionsToCreate);
    console.log(`${sectionsToCreate.length} Sections created (2 per course)`);

    console.log("✅ Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
  }
};

module.exports = seedDatabase;
