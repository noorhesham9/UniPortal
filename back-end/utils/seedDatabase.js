const Permission = require("../models/Permission");
const Role = require("../models/Role");
const User = require("../models/User");
const Department = require("../models/Department");
const Room = require("../models/room.model");
const Semester = require("../models/Semester");
const Course = require("../models/course.model");
const Section = require("../models/Section");
const StudyPlan = require("../models/StudyPlan");

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
  {
    name: "manage_courses",
    description: "Offer, activate, and deactivate courses in the catalog",
    category: "admin",
  },
  {
    name: "manage_rooms",
    description: "Create, update, and delete rooms",
    category: "admin",
  },
  {
    name: "manage_tuition",
    description: "Review and approve student tuition receipts",
    category: "admin",
  },
  {
    name: "assign_advisor",
    description: "Can be assigned as an academic advisor to students",
    category: "admin",
  },
  {
    name: "manage_super_admin",
    description: "Super admin exclusive controls",
    category: "admin",
  },
];

// ============================================================
// DEPARTMENTS - كلية العلوم جامعة القاهرة
// ============================================================
const departmentsData = [
  {
    name: "علوم حاسب منفرد",
    code: "CS",
    description: "برنامج علوم الحاسب المنفرد - كلية العلوم جامعة القاهرة",
    head_member: "رئيس قسم علوم الحاسب",
    status: "Active",
  },
  {
    name: "رياضيات / علوم حاسب",
    code: "MATH-CS",
    description:
      "برنامج الرياضيات وعلوم الحاسب المشترك - كلية العلوم جامعة القاهرة",
    head_member: "رئيس قسم الرياضيات",
    status: "Active",
  },
  {
    name: "رياضيات / إحصاء",
    code: "MATH-STAT",
    description:
      "برنامج الرياضيات والإحصاء المشترك - كلية العلوم جامعة القاهرة",
    head_member: "رئيس قسم الإحصاء",
    status: "Active",
  },
  {
    name: "فلك منفرد",
    code: "ASTRO",
    description: "برنامج الفلك المنفرد - كلية العلوم جامعة القاهرة",
    head_member: "رئيس قسم الفلك",
    status: "Active",
  },
  {
    name: "فيزياء / فلك",
    code: "PHY-ASTRO",
    description: "برنامج الفيزياء والفلك المشترك - كلية العلوم جامعة القاهرة",
    head_member: "رئيس قسم الفيزياء",
    status: "Active",
  },
  {
    name: "رياضيات منفرد",
    code: "MATH",
    description: "برنامج الرياضيات المنفرد - كلية العلوم جامعة القاهرة",
    head_member: "رئيس قسم الرياضيات",
    status: "Active",
  },
  {
    name: "كيمياء منفرد",
    code: "CHEM",
    description: "برنامج الكيمياء المنفرد - كلية العلوم جامعة القاهرة",
    head_member: "رئيس قسم الكيمياء",
    status: "Active",
  },
  {
    name: "كيمياء / جيولوجيا",
    code: "CHEM-GEO",
    description:
      "برنامج الكيمياء والجيولوجيا المشترك - كلية العلوم جامعة القاهرة",
    head_member: "رئيس قسم الكيمياء",
    status: "Active",
  },
  {
    name: "كيمياء / فيزياء",
    code: "CHEM-PHY",
    description:
      "برنامج الكيمياء والفيزياء المشترك - كلية العلوم جامعة القاهرة",
    head_member: "رئيس قسم الكيمياء",
    status: "Active",
  },
  {
    name: "جيوفيزياء منفرد",
    code: "GEOPHYS",
    description: "برنامج الجيوفيزياء المنفرد - كلية العلوم جامعة القاهرة",
    head_member: "رئيس قسم الجيوفيزياء",
    status: "Active",
  },
  {
    name: "فيزياء منفرد",
    code: "PHY",
    description: "برنامج الفيزياء المنفرد - كلية العلوم جامعة القاهرة",
    head_member: "رئيس قسم الفيزياء",
    status: "Active",
  },
  {
    name: "بيولوجيا منفرد",
    code: "BIO",
    description: "برنامج البيولوجيا المنفرد - كلية العلوم جامعة القاهرة",
    head_member: "رئيس قسم البيولوجيا",
    status: "Active",
  },
];

// ============================================================
// SHARED COURSES - Common courses taken by multiple departments
// ============================================================
const sharedCoursesData = [
  // Mathematics Foundation
  {
    code: "ر131",
    title: "تفاضل وتكامل وهندسة تحليلية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "ر132",
    title: "تفاضل وتكامل وهندسة تحليلية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "ر231",
    title: "تفاضل وتكامل وهندسة تحليلية (3)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "ر211",
    title: "جبر خطي وهندسة (1)",
    credits: 4,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "ر213",
    title: "الرياضيات المنقطعة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "ر122",
    title: "ميادي التحليل الرياضي",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "ر241",
    title: "المعادلات التفاضلية العادية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },

  // Physics Foundation
  {
    code: "ف101",
    title: "فيزياء عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "ف102",
    title: "فيزياء عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "ر170",
    title: "ميكانيكا نيوتونية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "ر271",
    title: "ميكانيكا نيوتونية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },

  // Chemistry Foundation
  {
    code: "ك101",
    title: "كيمياء عامة (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
  },
  {
    code: "ك102",
    title: "كيمياء عامة (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
  },

  // Statistics Foundation
  {
    code: "ص100",
    title: "إحصاء رياضي (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "ص201",
    title: "مقدمة نظرية الاحتمالات",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },

  // Computer Science Foundation
  {
    code: "س101",
    title: "ميادي البرمجة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
  },
  {
    code: "س201",
    title: "البرمجة الموجهة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
  },
  {
    code: "س202",
    title: "هياكل البيانات والخوارزميات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
  },
  {
    code: "س302",
    title: "تنظيم الحاسب",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "س401",
    title: "شبكات الحاسب",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
  },
  {
    code: "س305",
    title: "تحليل وتصميم خوارزميات",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "س309",
    title: "تحليل وتصميم نظم",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "س407",
    title: "الذكاء الاصطناعي",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
  },
  {
    code: "س404",
    title: "نظرية التشفير",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
  {
    code: "س408",
    title: "بحث ومقال",
    credits: 0,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
  },
];

// ============================================================
// DEPARTMENT-SPECIFIC COURSES
// ============================================================

// ============================================================
// COURSES - علوم حاسب منفرد (CS)
// ============================================================
const csCoursesData = [
  // Year 1, Semester 1
  {
    code: "CS110",
    title: "مقدمة للجبر",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },

  // Year 2, Semester 1
  {
    code: "CS305",
    title: "رسومات الحاسب",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "CS307",
    title: "نظم قواعد البيانات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "CS309",
    title: "تحليل وتصميم نظم",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },

  // Year 3, Semester 1 - Optional
  {
    code: "CS316",
    title: "نظم تعامل ومعالجة الملفات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 1,
  },

  // Year 3, Semester 2
  {
    code: "CS411",
    title: "نظرية الأعداد",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "CS305B",
    title: "نظم التشغيل الشكلية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },

  // Year 3, Semester 2 - Optional
  {
    code: "CS415",
    title: "المحاكاة والنمذجة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "CS416",
    title: "برمجة الأنظمة الحيوية",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "CS417",
    title: "الشبكات العصبية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "CS418",
    title: "نظم الموزعة المتقدمة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "CS441",
    title: "موضوعات مختارة لعلوم الحاسب (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "CS428",
    title: "المراقبة الإحصائية لجودة الإنتاج",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },

  // Year 4, Semester 1
  {
    code: "CS403",
    title: "تصميم لغات البرمجة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "CS407",
    title: "الذكاء الاصطناعي",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },

  // Year 4, Semester 1 - Optional
  {
    code: "CS422",
    title: "شبكات حاسب متقدم",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "CS306",
    title: "نظم تشغيل متقدم",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "CS425",
    title: "النظم الخبيرة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "CS427",
    title: "لغات برمجة مختارة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "CS428B",
    title: "موضوعات مختارة في علوم الحاسب (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },

  // Year 4, Semester 2
  {
    code: "CS404",
    title: "نظرية التشفير",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
  {
    code: "CS410",
    title: "تطوير البرمجيات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
];

// --- السنة الثالثة - الفصل الأول ---
const csYear3Sem1 = [
  {
    code: "س302",
    title: "تنظيم الحاسب",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "س304",
    title: "رسومات الحاسب",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "س305",
    title: "تحليل وتصميم خوارزميات",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "س307",
    title: "نظم قواعد البيانات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "س309",
    title: "تحليل وتصميم نظم",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  // اختياري
  {
    code: "ر305",
    title: "المنطق الرياضي والجبر البيولياني (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ر351",
    title: "التحليل العددي (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ر355",
    title: "نظرية التقريب (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ر311",
    title: "الطرق الرياضية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "س316",
    title: "نظم تعامل ومعالجة الملفات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 1,
  },
];

// --- السنة الثالثة - الفصل الثاني ---
const csYear3Sem2 = [
  {
    code: "س411",
    title: "نظرية الأعداد",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "س401",
    title: "شبكات الحاسب",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "س305ب",
    title: "نظم التشغيل الشكلية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  // اختياري
  {
    code: "ر441",
    title: "المعادلات التفاضلية الجزئية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ر475",
    title: "ديناميكا الموائع الحسابية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ر477",
    title: "نظرية المرونة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ر481",
    title: "نظرية التحكم الأمثل (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "س415",
    title: "المحاكاة والنمذجة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "س416",
    title: "برمجة الأنظمة الحيوية",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "س417",
    title: "الشبكات العصبية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "س418",
    title: "نظم الموزعة المتقدمة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "س441",
    title: "موضوعات مختارة لعلوم الحاسب (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "س428",
    title: "المراقبة الإحصائية لجودة الإنتاج",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
];

// --- السنة الرابعة - الفصل الأول ---
const csYear4Sem1 = [
  {
    code: "س403",
    title: "تصميم لغات البرمجة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "س407",
    title: "الذكاء الاصطناعي",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "س408",
    title: "بحث ومقال",
    credits: 0,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  // اختياري
  {
    code: "ر442",
    title: "المعادلات التفاضلية الجزئية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ر479",
    title: "ميكانيكا الموائع الحسابية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ر479ب",
    title: "ميكانيكا اللاخطية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "س482",
    title: "نظرية التحكم الأمثل (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "س491",
    title: "موضوعات مختارة في الرياضيات (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "س422",
    title: "شبكات حاسب متقدم",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "س306",
    title: "نظم تشغيل متقدم",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "س425",
    title: "النظم الخبيرة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "س427",
    title: "لغات برمجة مختارة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "س428ب",
    title: "موضوعات مختارة في علوم الحاسب (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
];

// --- السنة الرابعة - الفصل الثاني ---
const csYear4Sem2 = [
  {
    code: "س404",
    title: "نظرية التشفير",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
  {
    code: "س410",
    title: "تطوير البرمجيات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
];

const allCSCourses = [...csCoursesData];

// ============================================================
// COURSES - رياضيات / علوم حاسب (MATH-CS)
// ============================================================
const mathCSCoursesData = [
  // Year 2, Semester 1
  {
    code: "MATH-CS203",
    title: "تصميم البرمجة الشيئية",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },

  // Year 3, Semester 1
  {
    code: "MATH-CS306",
    title: "المنطق الرياضي والجبر البيولياني (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "MATH-CS311",
    title: "التحليل الحقيقي (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "MATH-CS222",
    title: "نظرية التقريب (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "MATH-CS301",
    title: "تطوير البرمجيات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "MATH-CS302",
    title: "نظم تشغيل الحاسب",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "MATH-CS307",
    title: "تصميم قواعد البيانات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },

  // Year 3, Semester 2
  {
    code: "MATH-CS316",
    title: "الكهرومغناطيسية والنسبية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "MATH-CS317",
    title: "النظم الموزعة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },

  // Year 4, Semester 1
  {
    code: "MATH-CS402",
    title: "تصميم المترجمات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "MATH-CS441",
    title: "موضوعات مختارة لعلوم الحاسب (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "MATH-CS428",
    title: "المراقبة الإحصائية لجودة الإنتاج",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },

  // Year 4, Semester 2
  {
    code: "MATH-CS410",
    title: "تطوير البرمجيات المتقدم",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
];

// ============================================================
// COURSES - رياضيات / إحصاء (ر/ص)
// ============================================================
const mathStatCoursesData = [
  // السنة الأولى - الفصل الأول
  {
    code: "ر/ص-ر131",
    title: "تفاضل وتكامل وهندسة تحليلية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ر/ص-ص100",
    title: "إحصاء رياضي (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ر/ص-ف101",
    title: "فيزياء عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ر/ص-ك101",
    title: "كيمياء عامة (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ر/ص-س101",
    title: "ميادي البرمجة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  // السنة الأولى - الفصل الثاني
  {
    code: "ر/ص-ر132",
    title: "تفاضل وتكامل وهندسة تحليلية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ر/ص-ر170",
    title: "ميكانيكا نيوتونية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ر/ص-ص201",
    title: "مقدمة نظرية الاحتمالات",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ر/ص-ف102",
    title: "فيزياء عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ر/ص-ك102",
    title: "كيمياء عامة (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  // السنة الثانية - الفصل الأول
  {
    code: "ر/ص-ر211",
    title: "جبر خطي وهندسة (1)",
    credits: 4,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ر/ص-ر232",
    title: "تفاضل وتكامل وهندسة تحليلية (3)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ر/ص-ر271",
    title: "ميكانيكا نيوتونية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ر/ص-ص202",
    title: "الاستدلال الإحصائي (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ر/ص-ص203",
    title: "نظرية الارتباط (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  // السنة الثانية - الفصل الثاني
  {
    code: "ر/ص-ر122",
    title: "ميادي التحليل الرياضي",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ر/ص-ر241",
    title: "المعادلات التفاضلية العادية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ر/ص-ص301",
    title: "الاستدلال الإحصائي (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ر/ص-ص302",
    title: "نظرية الارتباط (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ر/ص-س101ب",
    title: "الحاسب الآلي والبرمجة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  // السنة الثالثة - الفصل الأول
  {
    code: "ر/ص-ر311",
    title: "الجبر المجرد (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ر/ص-ر332",
    title: "التحليل الحقيقي (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ر/ص-ص303",
    title: "تحليل الانحدار",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ر/ص-ص304",
    title: "تصميم التجارب",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ر/ص-ص305",
    title: "تحليل الانحدار المتعدد",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  // السنة الثالثة - الفصل الثاني
  {
    code: "ر/ص-ص401",
    title: "الإحصاء اللابارامتري",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ر/ص-ص402",
    title: "تحليل السلاسل الزمنية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ر/ص-ص403",
    title: "اختيارات الحياة والصلاحية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ر/ص-ص404",
    title: "تحليل السلاسل الزمنية المتقدم",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  // السنة الرابعة - الفصل الأول
  {
    code: "ر/ص-ص431",
    title: "التحليل المركب (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ر/ص-ص481",
    title: "نظرية التحكم الأمثل (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ر/ص-ص403ب",
    title: "تصميم تجارب متقدم",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ر/ص-ص404ب",
    title: "إحصاء تطبيقي",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ر/ص-ص432",
    title: "الإحصاء الاقتصادي",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ر/ص-ص433",
    title: "اختيارات الحياة والصلاحية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ر/ص-ص434",
    title: "الإحصاء السكاني",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 4,
    semester_num: 1,
  },
  // السنة الرابعة - الفصل الثاني
  {
    code: "ر/ص-ص441",
    title: "موضوعات مختارة في الإحصاء",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
  {
    code: "ر/ص-ص442",
    title: "المراقبة الإحصائية لجودة الإنتاج",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
];

// ============================================================
// COURSES - فلك منفرد (ل)
// ============================================================
const astroCoursesData = [
  // السنة الأولى - الفصل الأول
  {
    code: "ل-ر131",
    title: "تفاضل وتكامل وهندسة تحليلية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ل-ف101",
    title: "فيزياء عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ل-ك101",
    title: "كيمياء عامة (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ل-ل111",
    title: "مقدمة تعلم الفلك",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  // السنة الأولى - الفصل الثاني
  {
    code: "ل-ر132",
    title: "تفاضل وتكامل وهندسة تحليلية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ل-ف102",
    title: "فيزياء عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ل-ك102",
    title: "كيمياء عامة (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ل-ل112",
    title: "مقدمة الفيزياء الفلكية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  // السنة الثانية - الفصل الأول
  {
    code: "ل-ر211",
    title: "جبر خطي وهندسة (1)",
    credits: 4,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ل-ر232",
    title: "تفاضل وتكامل وهندسة تحليلية (3)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ل-ف221",
    title: "ميكانيكا كلاسيكية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ل-ل111ب",
    title: "فلك كروي (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ل-ل215",
    title: "ميكانيكا سماوية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  // السنة الثانية - الفصل الثاني
  {
    code: "ل-ف241",
    title: "الكهرومغناطيسية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ل-ل111ج",
    title: "فلك كروي (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ل-ل213",
    title: "فلك كلاسيكي (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ل-ل212",
    title: "فيزياء فلكية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  // السنة الثالثة - الفصل الأول
  {
    code: "ل-ف303",
    title: "فيزياء عملية",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ل-ل301",
    title: "حسابات فلكية",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ل-ل303",
    title: "الحسابات المدارية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ل-ل311",
    title: "فلك كروي (3)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ل-ل313",
    title: "انتقال الإشعاع",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ل-ل315",
    title: "ميكانيكا سماوية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  // السنة الثالثة - الفصل الثاني
  {
    code: "ل-ل401",
    title: "تطبيقات فلكية على الحاسب (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ل-ل403",
    title: "معل فلك (1)",
    credits: 1,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ل-ل405",
    title: "معل رصد (1) بالمرصد",
    credits: 1,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ل-ل407",
    title: "تدريبات فلكية (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ل-ل409",
    title: "معل فلك فيزيائي",
    credits: 1,
    required_room_type: "Lab",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ل-ل411",
    title: "تركيب وديناميكا المجرة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ل-ل413",
    title: "فيزياء فلكية متنوعة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ل-ل415",
    title: "النظام الراديوي",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ل-ل417",
    title: "ديناميكا الحدود النجمية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ل-ل419",
    title: "نظريات المجال",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ل-ل421",
    title: "نظريات المجال",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ل-ل435",
    title: "النجوم الكثيفة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  // السنة الرابعة - الفصل الأول
  {
    code: "ل-ل471",
    title: "فيزياء الجوامد (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ل-ل481",
    title: "فيزياء نووية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ل-ل411ب",
    title: "فيزياء نووية (نووية)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  // السنة الرابعة - الفصل الثاني
  {
    code: "ل-ل472",
    title: "فيزياء الجوامد (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
  {
    code: "ل-ل482",
    title: "فيزياء نووية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
];

// ============================================================
// COURSES - فيزياء / فلك (ف/ل)
// ============================================================
const phyAstroCoursesData = [
  // السنة الأولى - الفصل الأول
  {
    code: "ف/ل-ر131",
    title: "تفاضل وتكامل وهندسة تحليلية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ف/ل-ف101",
    title: "فيزياء عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ف/ل-ك101",
    title: "كيمياء عامة (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ف/ل-ل111",
    title: "مقدمة تعلم الفلك",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  // السنة الأولى - الفصل الثاني
  {
    code: "ف/ل-ر132",
    title: "تفاضل وتكامل وهندسة تحليلية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ف/ل-ف102",
    title: "فيزياء عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ف/ل-ك102",
    title: "كيمياء عامة (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ف/ل-ل112",
    title: "مقدمة الفيزياء الفلكية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  // السنة الثانية - الفصل الأول
  {
    code: "ف/ل-ف201",
    title: "فيزياء عملية",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ف/ل-ف221",
    title: "ميكانيكا كلاسيكية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ف/ل-ف261",
    title: "فيزياء حديثة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ف/ل-ل301",
    title: "فيزياء فلكية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ف/ل-ل303",
    title: "حسابات فلكية",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ف/ل-ل311",
    title: "فلك كروي",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ف/ل-ل313",
    title: "انتقال الإشعاع",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ف/ل-ل315",
    title: "ميكانيكا سماوية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  // السنة الثانية - الفصل الثاني
  {
    code: "ف/ل-ف241",
    title: "الكهرومغناطيسية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ف/ل-ف311",
    title: "فيزياء الجوامد (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ف/ل-ف362",
    title: "فيزياء نووية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ف/ل-ل401",
    title: "تطبيقات فلكية على الحاسب",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  // السنة الثالثة - الفصل الأول
  {
    code: "ف/ل-ف371",
    title: "فيزياء الجوامد (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ف/ل-ف381",
    title: "فيزياء نووية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ف/ل-ف411",
    title: "فيزياء نووية (نووية)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ف/ل-ل411",
    title: "تركيب وديناميكا المجرة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ف/ل-ل413",
    title: "فيزياء فلكية متنوعة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 1,
  },
  // السنة الثالثة - الفصل الثاني
  {
    code: "ف/ل-ف472",
    title: "فيزياء الجوامد (3)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ف/ل-ف482",
    title: "فيزياء نووية (3)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ف/ل-ل471",
    title: "فيزياء الجوامد الفلكية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 3,
    semester_num: 2,
  },
  // السنة الرابعة - الفصل الأول
  {
    code: "ف/ل-ف401",
    title: "تطبيقات فلكية على الحاسب (3)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ف/ل-ف403",
    title: "معل فلك (2)",
    credits: 1,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ف/ل-ف405",
    title: "معل رصد (2) بالمرصد",
    credits: 1,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  // السنة الرابعة - الفصل الثاني
  {
    code: "ف/ل-ف471",
    title: "فيزياء الجوامد (4)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
  {
    code: "ف/ل-ف481",
    title: "فيزياء نووية (4)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
];

// ============================================================
// COURSES - رياضيات منفرد (ر)
// ============================================================
const mathCoursesData = [
  // السنة الأولى - الفصل الأول
  {
    code: "ر-ر131",
    title: "تفاضل وتكامل وهندسة تحليلية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ر-ص100",
    title: "إحصاء رياضي (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ر-ف101",
    title: "فيزياء عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ر-ك101",
    title: "كيمياء عامة (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ر-س110",
    title: "مقدمة للجبر",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  // السنة الأولى - الفصل الثاني
  {
    code: "ر-ر132",
    title: "تفاضل وتكامل وهندسة تحليلية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ر-ر170",
    title: "ميكانيكا نيوتونية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ر-ف102",
    title: "فيزياء عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ر-ك102",
    title: "كيمياء عامة (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ر-ص201",
    title: "مقدمة نظرية الاحتمالات",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  // السنة الثانية - الفصل الأول
  {
    code: "ر-ر211",
    title: "جبر خطي وهندسة (1)",
    credits: 4,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ر-ر232",
    title: "تفاضل وتكامل وهندسة تحليلية (3)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ر-ر271",
    title: "ميكانيكا نيوتونية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ر-ر213",
    title: "الرياضيات المنقطعة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ر-ر122",
    title: "ميادي التحليل الرياضي",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  // السنة الثانية - الفصل الثاني
  {
    code: "ر-ر241",
    title: "المعادلات التفاضلية العادية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ر-ر305",
    title: "المنطق الرياضي والجبر البيولياني (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ر-ر311",
    title: "التحليل الحقيقي (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ر-ر351",
    title: "التحليل العددي (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ر-ر355",
    title: "نظرية التقريب (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  // السنة الثالثة - الفصل الأول
  {
    code: "ر-ر306",
    title: "المنطق الرياضي والجبر البيولياني (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ر-ر332",
    title: "التحليل الحقيقي (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ر-ر441",
    title: "المعادلات التفاضلية الجزئية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ر-ر475",
    title: "ديناميكا الموائع الحسابية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ر-ر481",
    title: "نظرية التحكم الأمثل (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  // السنة الثالثة - الفصل الثاني
  {
    code: "ر-ر442",
    title: "المعادلات التفاضلية الجزئية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ر-ر479",
    title: "ديناميكا الموائع الحسابية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ر-ر479ب",
    title: "ميكانيكا اللاخطية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ر-ر482",
    title: "نظرية التحكم الأمثل (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ر-ر491",
    title: "موضوعات مختارة في الرياضيات (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  // السنة الرابعة - الفصل الأول
  {
    code: "ر-ر431",
    title: "التحليل المركب (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ر-ر492",
    title: "موضوعات مختارة في الرياضيات (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ر-بحث",
    title: "بحث ومقال",
    credits: 0,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
];

// ============================================================
// COURSES - كيمياء منفرد (ك)
// ============================================================
const chemCoursesData = [
  // السنة الأولى - الفصل الأول
  {
    code: "ك-ر131",
    title: "تفاضل وتكامل وهندسة تحليلية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ك-ف101",
    title: "فيزياء عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ك-ك101",
    title: "كيمياء عامة (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ك-ك111",
    title: "كيمياء عضوية (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ك-ك121",
    title: "كيمياء فيزيائية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  // السنة الأولى - الفصل الثاني
  {
    code: "ك-ر132",
    title: "تفاضل وتكامل وهندسة تحليلية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ك-ف102",
    title: "فيزياء عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ك-ك102",
    title: "كيمياء عامة (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ك-ك112",
    title: "كيمياء عضوية (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ك-ك122",
    title: "كيمياء فيزيائية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  // السنة الثانية - الفصل الأول
  {
    code: "ك-ر211",
    title: "جبر خطي وهندسة (1)",
    credits: 4,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ك-ك211",
    title: "كيمياء تحليلية (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ك-ك221",
    title: "كيمياء عضوية (3)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ك-ك231",
    title: "كيمياء فيزيائية (3)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ك-ك241",
    title: "كيمياء غير عضوية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  // السنة الثانية - الفصل الثاني
  {
    code: "ك-ك212",
    title: "كيمياء تحليلية (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ك-ك222",
    title: "كيمياء عضوية (4)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ك-ك232",
    title: "كيمياء فيزيائية (4)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ك-ك242",
    title: "كيمياء غير عضوية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ك-ك252",
    title: "كيمياء حيوية (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  // السنة الثالثة - الفصل الأول
  {
    code: "ك-ك311",
    title: "كيمياء تحليلية متقدمة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ك-ك321",
    title: "كيمياء عضوية متقدمة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ك-ك331",
    title: "كيمياء فيزيائية متقدمة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ك-ك341",
    title: "كيمياء غير عضوية متقدمة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ك-ك351",
    title: "كيمياء حيوية متقدمة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  // السنة الثالثة - الفصل الثاني
  {
    code: "ك-ك361",
    title: "كيمياء البوليمرات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ك-ك371",
    title: "كيمياء المنسقة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ك-ك381",
    title: "كيمياء السطوح",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ك-ك391",
    title: "كيمياء البيئة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ك-ك301",
    title: "مشروع تخرج (1)",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  // السنة الرابعة - الفصل الأول
  {
    code: "ك-ك401",
    title: "موضوعات مختارة في الكيمياء (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ك-ك402",
    title: "مشروع تخرج (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  // السنة الرابعة - الفصل الثاني
  {
    code: "ك-ك403",
    title: "موضوعات مختارة في الكيمياء (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
  {
    code: "ك-ك404",
    title: "مشروع تخرج (3)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
];

// ============================================================
// COURSES - فيزياء منفرد (ف)
// ============================================================
const phyCoursesData = [
  // السنة الأولى - الفصل الأول
  {
    code: "ف-ر131",
    title: "تفاضل وتكامل وهندسة تحليلية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ف-ف101",
    title: "فيزياء عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ف-ك101",
    title: "كيمياء عامة (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ف-ف111",
    title: "ميكانيكا (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ف-ف121",
    title: "فيزياء عملية (1)",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  // السنة الأولى - الفصل الثاني
  {
    code: "ف-ر132",
    title: "تفاضل وتكامل وهندسة تحليلية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ف-ف102",
    title: "فيزياء عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ف-ك102",
    title: "كيمياء عامة (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ف-ف112",
    title: "ميكانيكا (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ف-ف122",
    title: "فيزياء عملية (2)",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  // السنة الثانية - الفصل الأول
  {
    code: "ف-ر211",
    title: "جبر خطي وهندسة (1)",
    credits: 4,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ف-ف221",
    title: "ميكانيكا كلاسيكية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ف-ف231",
    title: "الكهرومغناطيسية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ف-ف241",
    title: "فيزياء حديثة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ف-ف251",
    title: "فيزياء عملية (3)",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  // السنة الثانية - الفصل الثاني
  {
    code: "ف-ف222",
    title: "ميكانيكا كلاسيكية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ف-ف232",
    title: "الكهرومغناطيسية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ف-ف311",
    title: "فيزياء الجوامد (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ف-ف362",
    title: "فيزياء نووية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ف-ف252",
    title: "فيزياء عملية (4)",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  // السنة الثالثة - الفصل الأول
  {
    code: "ف-ف371",
    title: "فيزياء الجوامد (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ف-ف381",
    title: "فيزياء نووية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ف-ف411",
    title: "فيزياء نووية (نووية)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ف-ف421",
    title: "فيزياء البلازما",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ف-ف351",
    title: "فيزياء عملية متقدمة",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  // السنة الثالثة - الفصل الثاني
  {
    code: "ف-ف472",
    title: "فيزياء الجوامد (3)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ف-ف482",
    title: "فيزياء نووية (3)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ف-ف431",
    title: "فيزياء الليزر",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ف-ف441",
    title: "فيزياء الجسيمات",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ف-ف301",
    title: "مشروع تخرج (1)",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  // السنة الرابعة - الفصل الأول
  {
    code: "ف-ف401",
    title: "موضوعات مختارة في الفيزياء (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ف-ف402",
    title: "مشروع تخرج (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  // السنة الرابعة - الفصل الثاني
  {
    code: "ف-ف403",
    title: "موضوعات مختارة في الفيزياء (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
  {
    code: "ف-ف404",
    title: "مشروع تخرج (3)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
];

// ============================================================
// COURSES - بيولوجيا منفرد (ب)
// ============================================================
const bioCoursesData = [
  // السنة الأولى - الفصل الأول
  {
    code: "ب-ر131",
    title: "تفاضل وتكامل وهندسة تحليلية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ب-ف101",
    title: "فيزياء عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ب-ك101",
    title: "كيمياء عامة (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ب-ب111",
    title: "أحياء عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ب-ب121",
    title: "أحياء عملية (1)",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  // السنة الأولى - الفصل الثاني
  {
    code: "ب-ر132",
    title: "تفاضل وتكامل وهندسة تحليلية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ب-ف102",
    title: "فيزياء عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ب-ك102",
    title: "كيمياء عامة (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ب-ب112",
    title: "أحياء عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ب-ب122",
    title: "أحياء عملية (2)",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  // السنة الثانية - الفصل الأول
  {
    code: "ب-ر211",
    title: "جبر خطي وهندسة (1)",
    credits: 4,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ب-ك211",
    title: "كيمياء عضوية (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ب-ب211",
    title: "علم الوراثة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ب-ب221",
    title: "علم النبات",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ب-ب231",
    title: "علم الحيوان",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  // السنة الثانية - الفصل الثاني
  {
    code: "ب-ك212",
    title: "كيمياء عضوية (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ب-ب212",
    title: "علم الخلايا",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ب-ب222",
    title: "علم الأنسجة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ب-ب232",
    title: "علم الفسيولوجيا",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ب-ب242",
    title: "علم البيئة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  // السنة الثالثة - الفصل الأول
  {
    code: "ب-ب311",
    title: "كيمياء حيوية (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ب-ب321",
    title: "علم المناعة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ب-ب331",
    title: "علم الأحياء الدقيقة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ب-ب341",
    title: "علم الوراثة الجزيئية",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ب-ب351",
    title: "علم التطور",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  // السنة الثالثة - الفصل الثاني
  {
    code: "ب-ب312",
    title: "كيمياء حيوية (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ب-ب322",
    title: "علم الأحياء الجزيئية",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ب-ب332",
    title: "علم الطفيليات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ب-ب342",
    title: "علم الأحياء التطبيقي",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ب-ب301",
    title: "مشروع تخرج (1)",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  // السنة الرابعة - الفصل الأول
  {
    code: "ب-ب401",
    title: "موضوعات مختارة في الأحياء (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ب-ب402",
    title: "مشروع تخرج (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  // السنة الرابعة - الفصل الثاني
  {
    code: "ب-ب403",
    title: "موضوعات مختارة في الأحياء (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
  {
    code: "ب-ب404",
    title: "مشروع تخرج (3)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
];

// ============================================================
// COURSES - كيمياء / جيولوجيا (ك/ج)
// ============================================================
const chemGeoCoursesData = [
  // السنة الأولى - الفصل الأول
  {
    code: "ك/ج-ر131",
    title: "تفاضل وتكامل وهندسة تحليلية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ك/ج-ف101",
    title: "فيزياء عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ك/ج-ك101",
    title: "كيمياء عامة (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ك/ج-ك111",
    title: "كيمياء عضوية (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ك/ج-ج111",
    title: "جيولوجيا عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  // السنة الأولى - الفصل الثاني
  {
    code: "ك/ج-ر132",
    title: "تفاضل وتكامل وهندسة تحليلية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ك/ج-ف102",
    title: "فيزياء عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ك/ج-ك102",
    title: "كيمياء عامة (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ك/ج-ك112",
    title: "كيمياء عضوية (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ك/ج-ج112",
    title: "جيولوجيا عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  // السنة الثانية - الفصل الأول
  {
    code: "ك/ج-ر211",
    title: "جبر خطي وهندسة (1)",
    credits: 4,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ك/ج-ك211",
    title: "كيمياء تحليلية (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ك/ج-ك221",
    title: "كيمياء عضوية (3)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ك/ج-ج211",
    title: "جيولوجيا المعادن",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ك/ج-ج221",
    title: "جيولوجيا الصخور",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  // السنة الثانية - الفصل الثاني
  {
    code: "ك/ج-ك212",
    title: "كيمياء تحليلية (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ك/ج-ك222",
    title: "كيمياء عضوية (4)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ك/ج-ج212",
    title: "جيولوجيا الهيكلية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ك/ج-ج222",
    title: "جيولوجيا الرواسب",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ك/ج-ج232",
    title: "جيولوجيا المياه الجوفية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  // السنة الثالثة - الفصل الأول
  {
    code: "ك/ج-ك311",
    title: "كيمياء تحليلية متقدمة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ك/ج-ك321",
    title: "كيمياء عضوية متقدمة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ك/ج-ج311",
    title: "جيوكيمياء",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ك/ج-ج321",
    title: "جيولوجيا البترول",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ك/ج-ج331",
    title: "جيولوجيا البيئة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  // السنة الثالثة - الفصل الثاني
  {
    code: "ك/ج-ك361",
    title: "كيمياء البوليمرات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ك/ج-ج312",
    title: "جيولوجيا المهندسية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ك/ج-ج322",
    title: "جيولوجيا الزلازل",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ك/ج-ج332",
    title: "جيولوجيا التربة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ك/ج-ج301",
    title: "مشروع تخرج (1)",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  // السنة الرابعة - الفصل الأول
  {
    code: "ك/ج-ك401",
    title: "موضوعات مختارة في الكيمياء",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ك/ج-ج401",
    title: "موضوعات مختارة في الجيولوجيا",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ك/ج-ج402",
    title: "مشروع تخرج (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  // السنة الرابعة - الفصل الثاني
  {
    code: "ك/ج-ج403",
    title: "مشروع تخرج (3)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
];

// ============================================================
// COURSES - كيمياء / فيزياء (ك/ف)
// ============================================================
const chemPhyCoursesData = [
  // السنة الأولى - الفصل الأول
  {
    code: "ك/ف-ر131",
    title: "تفاضل وتكامل وهندسة تحليلية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ك/ف-ف101",
    title: "فيزياء عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ك/ف-ك101",
    title: "كيمياء عامة (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ك/ف-ك111",
    title: "كيمياء عضوية (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ك/ف-ف111",
    title: "ميكانيكا (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  // السنة الأولى - الفصل الثاني
  {
    code: "ك/ف-ر132",
    title: "تفاضل وتكامل وهندسة تحليلية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ك/ف-ف102",
    title: "فيزياء عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ك/ف-ك102",
    title: "كيمياء عامة (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ك/ف-ك112",
    title: "كيمياء عضوية (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ك/ف-ف112",
    title: "ميكانيكا (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  // السنة الثانية - الفصل الأول
  {
    code: "ك/ف-ر211",
    title: "جبر خطي وهندسة (1)",
    credits: 4,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ك/ف-ك211",
    title: "كيمياء تحليلية (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ك/ف-ك221",
    title: "كيمياء عضوية (3)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ك/ف-ف221",
    title: "ميكانيكا كلاسيكية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ك/ف-ف231",
    title: "الكهرومغناطيسية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  // السنة الثانية - الفصل الثاني
  {
    code: "ك/ف-ك212",
    title: "كيمياء تحليلية (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ك/ف-ك222",
    title: "كيمياء عضوية (4)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ك/ف-ف222",
    title: "ميكانيكا كلاسيكية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ك/ف-ف232",
    title: "الكهرومغناطيسية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ك/ف-ف241",
    title: "فيزياء حديثة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  // السنة الثالثة - الفصل الأول
  {
    code: "ك/ف-ك311",
    title: "كيمياء تحليلية متقدمة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ك/ف-ك321",
    title: "كيمياء عضوية متقدمة",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ك/ف-ف311",
    title: "فيزياء الجوامد (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ك/ف-ف362",
    title: "فيزياء نووية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ك/ف-ك331",
    title: "كيمياء فيزيائية متقدمة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  // السنة الثالثة - الفصل الثاني
  {
    code: "ك/ف-ك361",
    title: "كيمياء البوليمرات",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ك/ف-ف371",
    title: "فيزياء الجوامد (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ك/ف-ف381",
    title: "فيزياء نووية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ك/ف-ك371",
    title: "كيمياء المنسقة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ك/ف-ك301",
    title: "مشروع تخرج (1)",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  // السنة الرابعة - الفصل الأول
  {
    code: "ك/ف-ك401",
    title: "موضوعات مختارة في الكيمياء",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ك/ف-ف401",
    title: "موضوعات مختارة في الفيزياء",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ك/ف-ك402",
    title: "مشروع تخرج (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  // السنة الرابعة - الفصل الثاني
  {
    code: "ك/ف-ك403",
    title: "مشروع تخرج (3)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
];

// ============================================================
// COURSES - جيوفيزياء منفرد (ج)
// ============================================================
const geophysCoursesData = [
  // السنة الأولى - الفصل الأول
  {
    code: "ج-ر131",
    title: "تفاضل وتكامل وهندسة تحليلية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ج-ف101",
    title: "فيزياء عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ج-ك101",
    title: "كيمياء عامة (1)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ج-ج111",
    title: "جيولوجيا عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ج-ج121",
    title: "جيوفيزياء عامة (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  // السنة الأولى - الفصل الثاني
  {
    code: "ج-ر132",
    title: "تفاضل وتكامل وهندسة تحليلية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ج-ف102",
    title: "فيزياء عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ج-ك102",
    title: "كيمياء عامة (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ج-ج112",
    title: "جيولوجيا عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ج-ج122",
    title: "جيوفيزياء عامة (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  // السنة الثانية - الفصل الأول
  {
    code: "ج-ر211",
    title: "جبر خطي وهندسة (1)",
    credits: 4,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ج-ف221",
    title: "ميكانيكا كلاسيكية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ج-ف231",
    title: "الكهرومغناطيسية (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ج-ج211",
    title: "جيولوجيا المعادن",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ج-ج221",
    title: "جيوفيزياء الزلازل",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  // السنة الثانية - الفصل الثاني
  {
    code: "ج-ف222",
    title: "ميكانيكا كلاسيكية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ج-ف232",
    title: "الكهرومغناطيسية (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ج-ج212",
    title: "جيولوجيا الهيكلية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ج-ج222",
    title: "جيوفيزياء المغناطيسية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  {
    code: "ج-ج232",
    title: "جيوفيزياء الكهربائية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 2,
  },
  // السنة الثالثة - الفصل الأول
  {
    code: "ج-ف311",
    title: "فيزياء الجوامد (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ج-ج311",
    title: "جيوكيمياء",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ج-ج321",
    title: "جيوفيزياء الجاذبية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ج-ج331",
    title: "جيوفيزياء الرادار الأرضي",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  {
    code: "ج-ج341",
    title: "جيوفيزياء المياه الجوفية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 1,
  },
  // السنة الثالثة - الفصل الثاني
  {
    code: "ج-ف371",
    title: "فيزياء الجوامد (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ج-ج312",
    title: "جيولوجيا المهندسية",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ج-ج322",
    title: "جيوفيزياء الزلازل المتقدمة",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ج-ج332",
    title: "جيوفيزياء التطبيقية",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  {
    code: "ج-ج301",
    title: "مشروع تخرج (1)",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 3,
    semester_num: 2,
  },
  // السنة الرابعة - الفصل الأول
  {
    code: "ج-ج401",
    title: "موضوعات مختارة في الجيوفيزياء (1)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  {
    code: "ج-ج402",
    title: "مشروع تخرج (2)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 1,
  },
  // السنة الرابعة - الفصل الثاني
  {
    code: "ج-ج403",
    title: "موضوعات مختارة في الجيوفيزياء (2)",
    credits: 3,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
  {
    code: "ج-ج404",
    title: "مشروع تخرج (3)",
    credits: 3,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 4,
    semester_num: 2,
  },
];

// ============================================================
// UNIVERSITY REQUIREMENTS - متطلبات الجامعة (مشتركة لكل الأقسام)
// ============================================================
const universityRequirementsData = [
  {
    code: "U110",
    title: "تفكير نقدي",
    credits: 0,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "U111",
    title: "ريادة الأعمال",
    credits: 0,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 2,
    semester_num: 1,
  },
  {
    code: "ع101",
    title: "الحاسب الآلي",
    credits: 2,
    required_room_type: "Lab",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ع102",
    title: "اللغة الإنجليزية",
    credits: 2,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 1,
  },
  {
    code: "ع103",
    title: "قضايا مجتمعية",
    credits: 2,
    required_room_type: "Lecture Hall",
    course_type: "إجباري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ع104",
    title: "مبادئ القانون وقانون المهنة",
    credits: 2,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ع105",
    title: "مبادئ الإدارة والمحاسبة",
    credits: 2,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ع106",
    title: "اللغة العربية",
    credits: 2,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ع107",
    title: "الثقافة الإسلامية",
    credits: 2,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ع108",
    title: "تاريخ وفلسفة العلوم",
    credits: 2,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 1,
    semester_num: 2,
  },
  {
    code: "ع109",
    title: "الثقافة البيئية",
    credits: 2,
    required_room_type: "Lecture Hall",
    course_type: "اختياري",
    academic_year: 1,
    semester_num: 2,
  },
];

// ============================================================
// SEED FUNCTION
// ============================================================
const seedDatabase = async () => {
  try {
    // 1. Cleanup
    await Permission.deleteMany();
    await Role.deleteMany();
    await User.deleteMany();
    await Department.deleteMany();
    await Room.deleteMany();
    await Semester.deleteMany();
    await StudyPlan.deleteMany();
    await Course.deleteMany();

    try {
      await Room.collection.dropIndex("room_number_1");
    } catch (e) {
      /* index might not exist */
    }

    console.log("Existing data cleared...");

    // 2. Departments
    const departments = await Department.insertMany(departmentsData);
    const deptMap = {};
    departments.forEach((d) => {
      deptMap[d.code] = d._id;
    });
    console.log(`${departments.length} Departments created`);

    // 3. Permissions & Roles
    const createdPermissions = await Permission.insertMany(permissions);
    const allPermissionIds = createdPermissions.map((p) => p._id);

    const superAdminRole = await Role.create({
      name: "super_admin",
      description: "Super Administrator with unrestricted system access",
      permissions: allPermissionIds,
    });

    const adminPermissions = createdPermissions
      .filter(
        (p) =>
          ![
            "manage_super_admin",
            "manage_roles",
            "delete_user",
            "delete_department",
          ].includes(p.name),
      )
      .map((p) => p._id);
    const adminRole = await Role.create({
      name: "admin",
      description: "Administrator with full access to academic management",
      permissions: adminPermissions,
    });

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
          "assign_advisor",
        ].includes(p.name),
      )
      .map((p) => p._id);
    const professorRole = await Role.create({
      name: "professor",
      description: "Professor can manage sections, grades, and attendance",
      permissions: professorPermissions,
    });

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

    console.log("Roles created successfully");

    // 4. Users
    const users = [
      {
        firebaseUid: "n9FOIHlsn5hpt888Rf6NIx5EBLz1",
        name: "Noor Hesham",
        email: "norhsham02@gmail.com",
        role: superAdminRole._id,
        is_active: true,
      },
      {
        firebaseUid: "W1Tn78B2vReT9wH5y3QNhXxavcJ3",
        name: "Noor Hesham 1",
        email: "nnn@gmail.com",
        role: studentRole._id,
        studentId: "STU-2024-0001",
        department: deptMap["CS"],
        level: "1",
        is_active: true,
      },
      {
        firebaseUid: "admin_test_uid_123",
        name: "Main Admin",
        email: "admin@university.edu",
        role: adminRole._id,
        department: deptMap["CS"],
        is_active: true,
      },
      {
        firebaseUid: "professor_test_uid_456",
        name: "Dr. Ahmed Ali",
        email: "ahmed@university.edu",
        role: professorRole._id,
        department: deptMap["CS"],
        is_active: true,
      },
      {
        firebaseUid: "student_test_uid_789",
        name: "Omar Khaled",
        email: "omar@student.edu",
        role: studentRole._id,
        studentId: "STU-2024-0002",
        department: deptMap["MATH-CS"],
        level: "2",
        is_active: true,
        isStudent: true,
      },
      {
        firebaseUid: "professor_test_uid_002",
        name: "Dr. Sara Mohamed",
        email: "sara@university.edu",
        role: professorRole._id,
        department: deptMap["MATH-STAT"],
        is_active: true,
      },
      {
        firebaseUid: "professor_test_uid_003",
        name: "Dr. Karim Hassan",
        email: "karim@university.edu",
        role: professorRole._id,
        department: deptMap["ASTRO"],
        is_active: true,
      },
      {
        firebaseUid: "professor_test_uid_004",
        name: "Dr. Nadia Mahmoud",
        email: "nadia@university.edu",
        role: professorRole._id,
        department: deptMap["PHY-ASTRO"],
        is_active: true,
      },
    ];
    await User.insertMany(users);
    console.log("Users created successfully");

    // 5. Rooms
    const roomsToAdd = [
      {
        room_name: "A101",
        building_section: "A",
        type: "Lecture Hall",
        capacity: 80,
      },
      {
        room_name: "A102",
        building_section: "A",
        type: "Lecture Hall",
        capacity: 60,
      },
      {
        room_name: "A103",
        building_section: "A",
        type: "Lecture Hall",
        capacity: 100,
      },
      { room_name: "B201", building_section: "B", type: "Lab", capacity: 30 },
      { room_name: "B202", building_section: "B", type: "Lab", capacity: 30 },
      { room_name: "B203", building_section: "B", type: "Lab", capacity: 40 },
      {
        room_name: "C301",
        building_section: "C",
        type: "Tutorial",
        capacity: 25,
      },
      {
        room_name: "C302",
        building_section: "C",
        type: "Tutorial",
        capacity: 25,
      },
      {
        room_name: "D401",
        building_section: "D",
        type: "Lecture Hall",
        capacity: 120,
      },
    ];
    for (const room of roomsToAdd) {
      await Room.findOneAndUpdate(
        { room_name: room.room_name },
        { $setOnInsert: room },
        { upsert: true },
      );
    }
    console.log(`${roomsToAdd.length} Rooms added`);

    // 6. Semesters
    const semestersToAdd = [
      {
        year: 2024,
        term: "Fall",
        is_active: false,
        start_date: new Date("2024-09-01"),
        end_date: new Date("2024-12-20"),
        add_drop_start: new Date("2024-08-25"),
        add_drop_end: new Date("2024-09-15"),
      },
      {
        year: 2025,
        term: "Spring",
        is_active: true,
        start_date: new Date("2025-02-01"),
        end_date: new Date("2025-05-25"),
        add_drop_start: new Date("2025-01-25"),
        add_drop_end: new Date("2025-02-15"),
      },
      {
        year: 2025,
        term: "Fall",
        is_active: false,
        start_date: new Date("2025-09-01"),
        end_date: new Date("2025-12-20"),
        add_drop_start: new Date("2025-08-25"),
        add_drop_end: new Date("2025-09-15"),
      },
    ];
    for (const semester of semestersToAdd) {
      await Semester.findOneAndUpdate(
        { year: semester.year, term: semester.term },
        { $setOnInsert: semester },
        { upsert: true },
      );
    }
    console.log(`${semestersToAdd.length} Semesters added`);

    // Normalize course code to one letter + numeric value, unify shared codes
    const normalizeCourseCode = (rawCode) => {
      if (!rawCode || typeof rawCode !== "string") return rawCode;
      let code = rawCode.trim();

      // Remove existing department prefixes and separators
      code = code.replace(/^ر\/ص-/, "");
      code = code.replace(/^ر-/, "");
      code = code.replace(/^ف\/ل-/, "");
      code = code.replace(/^ر\/ل-/, "");
      code = code.replace(/^ر\//, "");

      // Arabic and English code normalization
      if (/^CS/i.test(code)) code = code.replace(/^CS/i, "س");
      if (/^MATH-CS/i.test(code)) code = code.replace(/^MATH-CS/i, "س");
      else if (/^MATH-STAT/i.test(code))
        code = code.replace(/^MATH-STAT/i, "ص");
      else if (/^MATH/i.test(code)) code = code.replace(/^MATH/i, "ر");
      if (/^PHY-ASTRO/i.test(code)) code = code.replace(/^PHY-ASTRO/i, "ج");
      else if (/^ASTRO/i.test(code)) code = code.replace(/^ASTRO/i, "ج");
      else if (/^GEOPHYS/i.test(code)) code = code.replace(/^GEOPHYS/i, "جف");
      else if (/^GEO/i.test(code)) code = code.replace(/^GEO/i, "ج");
      if (/^PHYS/i.test(code)) code = code.replace(/^PHYS/i, "ف");
      if (/^CHEM/i.test(code)) code = code.replace(/^CHEM/i, "ك");
      if (/^STAT/i.test(code)) code = code.replace(/^STAT/i, "ص");
      if (/^BIO/i.test(code)) code = code.replace(/^BIO/i, "ع");
      if (/^من/.test(code)) code = code.replace(/^من/, "س");

      // Remove combined letters prefix like ر-ر, ر-ص, ر-س...
      code = code.replace(/^ر-(?=[\u0621-\u064A])/u, "");

      // Normalize to one initial letter where possible
      const arabicStd = code.match(/^([\u0621-\u064A]+)/u);
      if (arabicStd && arabicStd[1] && arabicStd[1].length > 1) {
        // Keep 'جف' code as is (some departments may use جف) else take first char
        if (!code.startsWith("جف")) {
          code = code.replace(/^([\u0621-\u064A]+)(.*)/u, "$1$2");
          // This will preserve the string if starts with single arabic letter.
        }
      }

      return code;
    };

    const normalizeCourseArray = (arr) => {
      arr.forEach((course) => {
        if (course.code) {
          course.code = normalizeCourseCode(course.code);
        }
      });
    };

    // apply normalization to all course definitions
    normalizeCourseArray(sharedCoursesData);
    normalizeCourseArray(universityRequirementsData);
    normalizeCourseArray(csCoursesData);
    normalizeCourseArray(mathCSCoursesData);
    normalizeCourseArray(mathStatCoursesData);
    normalizeCourseArray(astroCoursesData);
    normalizeCourseArray(phyAstroCoursesData);
    normalizeCourseArray(mathCoursesData);
    normalizeCourseArray(chemCoursesData);
    normalizeCourseArray(chemGeoCoursesData);
    normalizeCourseArray(chemPhyCoursesData);
    normalizeCourseArray(geophysCoursesData);
    normalizeCourseArray(phyCoursesData);
    normalizeCourseArray(bioCoursesData);

    // 7. Courses - insert shared courses and department-specific courses
    // First, insert shared courses
    const insertedSharedCourses = await Course.insertMany(sharedCoursesData);
    console.log(`${insertedSharedCourses.length} shared courses inserted`);

    // Create a map of shared courses for easy reference
    const sharedCourseMap = {};
    insertedSharedCourses.forEach((course) => {
      sharedCourseMap[course.code] = course._id;
    });

    const studyPlanEntries = [];

    // Add shared courses to ALL departments
    const sharedCoursesForAll = [
      // Year 1, Semester 1
      { code: "ر131", year: 1, semester: 1 }, // تفاضل وتكامل وهندسة تحليلية (1)
      { code: "ف101", year: 1, semester: 1 }, // فيزياء عامة (1)
      { code: "ك101", year: 1, semester: 1 }, // كيمياء عامة (1)
      { code: "ص100", year: 1, semester: 1 }, // إحصاء رياضي (1)

      // Year 1, Semester 2
      { code: "ر132", year: 1, semester: 2 }, // تفاضل وتكامل وهندسة تحليلية (2)
      { code: "ف102", year: 1, semester: 2 }, // فيزياء عامة (2)
      { code: "ك102", year: 1, semester: 2 }, // كيمياء عامة (2)
      { code: "ر170", year: 1, semester: 2 }, // ميكانيكا نيوتونية (1)
      { code: "ص201", year: 1, semester: 2 }, // مقدمة نظرية الاحتمالات

      // Year 2, Semester 1
      { code: "ر211", year: 2, semester: 1 }, // جبر خطي وهندسة (1)
      { code: "ر231", year: 2, semester: 1 }, // تفاضل وتكامل وهندسة تحليلية (3)
      { code: "ر271", year: 2, semester: 1 }, // ميكانيكا نيوتونية (2)

      // Year 2, Semester 2
      { code: "ر213", year: 2, semester: 2 }, // الرياضيات المنقطعة
      { code: "ر122", year: 2, semester: 2 }, // ميادي التحليل الرياضي
      { code: "ر241", year: 2, semester: 2 }, // المعادلات التفاضلية العادية
    ];

    // Add shared courses to all departments
    for (const dept of departments) {
      for (const sharedCourse of sharedCoursesForAll) {
        const courseId = sharedCourseMap[sharedCourse.code];
        if (courseId) {
          studyPlanEntries.push({
            department: dept._id,
            course: courseId,
            academic_year: sharedCourse.year,
            semester_num: sharedCourse.semester,
            course_type: "إجباري",
          });
        } else {
          console.log(
            `Warning: Course code ${sharedCourse.code} not found in shared courses`,
          );
        }
      }
    }

    // Add department-specific shared courses
    const deptSpecificSharedCourses = {
      CS: [
        { code: "س101", year: 1, semester: 2 }, // ميادي البرمجة
        { code: "س201", year: 2, semester: 1 }, // البرمجة الموجهة
        { code: "س202", year: 2, semester: 2 }, // هياكل البيانات والخوارزميات
        { code: "س302", year: 2, semester: 2 }, // تنظيم الحاسب
        { code: "س401", year: 3, semester: 2 }, // شبكات الحاسب
        { code: "س305", year: 3, semester: 2 }, // تحليل وتصميم خوارزميات
        { code: "س309", year: 3, semester: 2 }, // تحليل وتصميم نظم
        { code: "س407", year: 4, semester: 1 }, // الذكاء الاصطناعي
        { code: "س404", year: 4, semester: 2 }, // نظرية التشفير
        { code: "س408", year: 4, semester: 1 }, // بحث ومقال
      ],
      "MATH-CS": [
        { code: "س101", year: 1, semester: 1 }, // ميادي البرمجة
        { code: "س201", year: 2, semester: 1 }, // البرمجة الموجهة
        { code: "س202", year: 2, semester: 2 }, // هياكل البيانات والخوارزميات
        { code: "س302", year: 2, semester: 2 }, // تنظيم الحاسب
        { code: "س401", year: 3, semester: 2 }, // شبكات الحاسب
        { code: "س305", year: 3, semester: 2 }, // تحليل وتصميم خوارزميات
        { code: "س309", year: 3, semester: 2 }, // تحليل وتصميم نظم
        { code: "س407", year: 4, semester: 1 }, // الذكاء الاصطناعي
        { code: "س404", year: 4, semester: 2 }, // نظرية التشفير
        { code: "س408", year: 4, semester: 1 }, // بحث ومقال
      ],
      "MATH-STAT": [
        { code: "س101", year: 2, semester: 2 }, // الحاسب الآلي والبرمجة
      ],
    };

    // Add department-specific shared courses
    for (const [deptCode, courses] of Object.entries(
      deptSpecificSharedCourses,
    )) {
      const deptId = deptMap[deptCode];
      for (const course of courses) {
        const courseId = sharedCourseMap[course.code];
        if (courseId) {
          studyPlanEntries.push({
            department: deptId,
            course: courseId,
            academic_year: course.year,
            semester_num: course.semester,
            course_type: "إجباري",
          });
        } else {
          console.log(
            `Warning: Course code ${course.code} not found in shared courses for ${deptCode}`,
          );
        }
      }
    }

    const deptCourseMap = {
      CS: csCoursesData,
      "MATH-CS": mathCSCoursesData,
      "MATH-STAT": mathStatCoursesData,
      ASTRO: astroCoursesData,
      "PHY-ASTRO": phyAstroCoursesData,
      MATH: mathCoursesData,
      CHEM: chemCoursesData,
      "CHEM-GEO": chemGeoCoursesData,
      "CHEM-PHY": chemPhyCoursesData,
      GEOPHYS: geophysCoursesData,
      PHY: phyCoursesData,
      BIO: bioCoursesData,
    };

    // University requirements are shared - insert once
    const insertedUnivReqs = await Course.insertMany(
      universityRequirementsData,
    );
    console.log(
      `${insertedUnivReqs.length} University requirement courses inserted`,
    );

    // Add university requirements to all departments
    for (const dept of departments) {
      for (const course of insertedUnivReqs) {
        const meta = universityRequirementsData.find(
          (c) => c.code === course.code,
        );
        studyPlanEntries.push({
          department: dept._id,
          course: course._id,
          academic_year: meta.academic_year,
          semester_num: meta.semester_num,
          course_type: meta.course_type,
        });
      }
    }

    // Insert department-specific courses and build study plan
    const globalCourseCodes = new Set(Object.keys(sharedCourseMap));

    for (const [deptCode, coursesData] of Object.entries(deptCourseMap)) {
      const deptId = deptMap[deptCode];

      // Exclude already-shared codes (dedupe) and newly inserted duplicates.
      const uniqueCourses = coursesData.filter((course) => {
        const normalizedCode = normalizeCourseCode(course.code);
        course.code = normalizedCode;
        if (globalCourseCodes.has(normalizedCode)) {
          return false; // already exists as shared or in another dept
        }
        globalCourseCodes.add(normalizedCode);
        return true;
      });

      if (uniqueCourses.length > 0) {
        const insertedCourses = await Course.insertMany(uniqueCourses);
        console.log(
          `${insertedCourses.length} courses inserted for ${deptCode}`,
        );

        insertedCourses.forEach((course, i) => {
          const meta = uniqueCourses[i];
          studyPlanEntries.push({
            department: deptId,
            course: course._id,
            academic_year: meta.academic_year,
            semester_num: meta.semester_num,
            course_type: meta.course_type,
          });
        });
      } else {
        console.log(
          `0 unique department-specific courses to insert for ${deptCode}`,
        );
      }
    }

    await StudyPlan.insertMany(studyPlanEntries);
    console.log(`${studyPlanEntries.length} StudyPlan entries created`);

    // 8. Sections for active semester
    await Section.deleteMany();
    const activeSemester = await Semester.findOne({ is_active: true });
    const profRole = await Role.findOne({ name: "professor" });
    const professors = await User.find({ role: profRole._id }).lean();
    const rooms = await Room.find().lean();

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

    const allCourses = await Course.find().lean();
    let slotIndex = 0;
    const sectionsToCreate = [];

    for (const course of allCourses) {
      const matchingRooms = rooms.filter(
        (r) => r.type === course.required_room_type,
      );
      const roomPool = matchingRooms.length ? matchingRooms : rooms;
      const room1 = roomPool[slotIndex % roomPool.length];
      const room2 = roomPool[(slotIndex + 1) % roomPool.length];
      const d1 = slotIndex % days.length;
      const t1 = Math.floor(slotIndex / days.length) % timeSlots.length;
      const d2 = (slotIndex + 2) % days.length;
      const t2 = Math.floor((slotIndex + 2) / days.length) % timeSlots.length;
      const instructor1 = professors[slotIndex % professors.length];
      const instructor2 = professors[(slotIndex + 1) % professors.length];

      sectionsToCreate.push(
        {
          sectionNumber: 1,
          course_id: course._id,
          semester_id: activeSemester._id,
          instructor_id: instructor1._id,
          room_id: room1._id,
          day: days[d1],
          start_time: timeSlots[t1][0],
          end_time: timeSlots[t1][1],
          capacity: 40,
        },
        {
          sectionNumber: 2,
          course_id: course._id,
          semester_id: activeSemester._id,
          instructor_id: instructor2._id,
          room_id: room2._id,
          day: days[d2],
          start_time: timeSlots[t2][0],
          end_time: timeSlots[t2][1],
          capacity: 40,
        },
      );
      slotIndex += 3;
    }

    await Section.insertMany(sectionsToCreate);
    console.log(`${sectionsToCreate.length} Sections created`);

    console.log("✅ Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    throw error;
  }
};

module.exports = seedDatabase;
