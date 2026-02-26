const Permission = require("../models/Permission");
const Role = require("../models/Role");
const User = require("../models/User");
const Department = require("../models/Department");

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
    ];

    await User.insertMany(users);
    console.log("Seed users created successfully");

    console.log("✅ Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
  }
};

module.exports = seedDatabase;
