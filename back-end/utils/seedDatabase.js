const Permission = require("../models/Permission");
const Role = require("../models/Role");
const User = require("../models/User");
const Department = require("../models/Department");
const Room = require("../models/room.model");
const Semester = require("../models/Semester");
const Course = require("../models/course.model");
const Section = require("../models/Section");
const StudyPlan = require("../models/StudyPlan");
const Announcement = require("../models/Announcement");

// ============================================================
// PERMISSIONS
// ============================================================
const permissions = [
  { name: "view_users", description: "View all users", category: "users" },
  { name: "create_user", description: "Create new user", category: "users" },
  { name: "update_user", description: "Update user details", category: "users" },
  { name: "delete_user", description: "Delete user", category: "users" },
  { name: "view_courses", description: "View all courses", category: "courses" },
  { name: "create_course", description: "Create new course", category: "courses" },
  { name: "update_course", description: "Update course details", category: "courses" },
  { name: "delete_course", description: "Delete course", category: "courses" },
  { name: "view_sections", description: "View all sections", category: "sections" },
  { name: "create_section", description: "Create new section", category: "sections" },
  { name: "update_section", description: "Update section details", category: "sections" },
  { name: "delete_section", description: "Delete section", category: "sections" },
  { name: "view_enrollments", description: "View all enrollments", category: "enrollments" },
  { name: "create_enrollment", description: "Enroll student in course", category: "enrollments" },
  { name: "update_enrollment", description: "Update enrollment status", category: "enrollments" },
  { name: "delete_enrollment", description: "Remove enrollment", category: "enrollments" },
  { name: "manage_waitlist", description: "Manage course waitlist", category: "enrollments" },
  { name: "view_registration_slices", description: "View registration slices", category: "enrollments" },
  { name: "create_registration_slice", description: "Create new registration slice", category: "enrollments" },
  { name: "update_registration_slice", description: "Update registration slice", category: "enrollments" },
  { name: "delete_registration_slice", description: "Delete registration slice", category: "enrollments" },
  { name: "view_departments", description: "View all departments", category: "departments" },
  { name: "create_department", description: "Create new department", category: "departments" },
  { name: "update_department", description: "Update department details", category: "departments" },
  { name: "delete_department", description: "Delete department", category: "departments" },
  { name: "view_roles", description: "View all roles", category: "roles" },
  { name: "manage_roles", description: "Manage roles and permissions", category: "roles" },
  { name: "view_grades", description: "View student grades", category: "grades" },
  { name: "manage_grades", description: "Input and edit grades", category: "grades" },
  { name: "view_attendance", description: "View attendance records", category: "attendance" },
  { name: "manage_attendance", description: "Take attendance", category: "attendance" },
  { name: "admin_allowed_ids", description: "View and manage allowed user IDs for registration", category: "admin" },
  { name: "manage_courses", description: "Offer, activate, and deactivate courses in the catalog", category: "admin" },
  { name: "manage_rooms", description: "Create, update, and delete rooms", category: "admin" },
  { name: "manage_tuition", description: "Review and approve student tuition receipts", category: "admin" },
  { name: "assign_advisor", description: "Can be assigned as an academic advisor to students", category: "admin" },
  { name: "manage_super_admin", description: "Super admin exclusive controls", category: "admin" },
];

// ============================================================
// DEPARTMENTS - 3 أقسام فقط
// ============================================================
const departmentsData = [
  { name: "رياضيات / علوم حاسب", code: "MATH-CS", description: "برنامج الرياضيات وعلوم الحاسب المشترك", head_member: "رئيس القسم", status: "Active", required_credits: 132 },
  { name: "علوم حاسب منفرد",     code: "CS",      description: "برنامج علوم الحاسب المنفرد",           head_member: "رئيس القسم", status: "Active", required_credits: 132 },
  { name: "رياضيات منفرد",       code: "MATH",    description: "برنامج الرياضيات المنفرد",             head_member: "رئيس القسم", status: "Active", required_credits: 132 },
];

// ============================================================
// SHARED COURSES - مواد مشتركة بين الأقسام
// ============================================================
const sharedCourses = [
  // السنة 1
  { code: "ر110",  title: "مقدمة للجبر",                              credits: 3, required_room_type: "Lecture Hall", min_level: 1 },
  { code: "ر131",  title: "تفاضل وتكامل وهندسة تحليلية (1)",          credits: 3, required_room_type: "Lecture Hall", min_level: 1 },
  { code: "ر132",  title: "تفاضل وتكامل وهندسة تحليلية (2)",          credits: 3, required_room_type: "Lecture Hall", min_level: 1 },
  { code: "ص100",  title: "إحصاء رياضي (1)",                          credits: 3, required_room_type: "Lecture Hall", min_level: 1 },
  { code: "ف101",  title: "فيزياء عامة (1)",                          credits: 3, required_room_type: "Lecture Hall", min_level: 1 },
  { code: "ف102",  title: "فيزياء عامة (2)",                          credits: 3, required_room_type: "Lecture Hall", min_level: 1 },
  { code: "ك101",  title: "كيمياء عامة (1)",                          credits: 3, required_room_type: "Lab",          min_level: 1 },
  { code: "ك102",  title: "كيمياء عامة (2)",                          credits: 3, required_room_type: "Lab",          min_level: 1 },
  { code: "ر170",  title: "الميكانيكا النيوتونية (1)",                 credits: 3, required_room_type: "Lecture Hall", min_level: 1 },
  { code: "س101",  title: "مبادئ البرمجة",                            credits: 3, required_room_type: "Lab",          min_level: 1 },
  { code: "U110",  title: "تفكير نقدي",                               credits: 2, required_room_type: "Lecture Hall", min_level: 1 },
  { code: "U111",  title: "ريادة الأعمال",                            credits: 2, required_room_type: "Lecture Hall", min_level: 1 },
  { code: "ع101",  title: "الحاسب الآلي",                             credits: 2, required_room_type: "Lab",          min_level: 1 },
  { code: "ع102",  title: "اللغة الإنجليزية",                         credits: 2, required_room_type: "Lecture Hall", min_level: 1 },
  { code: "U103",  title: "قضايا مجتمعية",                            credits: 2, required_room_type: "Lecture Hall", min_level: 1 },
  // السنة 2
  { code: "ر211",  title: "جبر خطي وهندسة (1)",                       credits: 4, required_room_type: "Lecture Hall", min_level: 2 },
  { code: "ر212",  title: "جبر خطي وهندسة (2)",                       credits: 4, required_room_type: "Lecture Hall", min_level: 2 },
  { code: "ر213",  title: "الرياضيات المتقطعة",                        credits: 3, required_room_type: "Lecture Hall", min_level: 2 },
  { code: "ر231",  title: "تفاضل وتكامل وهندسة تحليلية (3)",          credits: 4, required_room_type: "Lecture Hall", min_level: 2 },
  { code: "ر232",  title: "مبادئ التحليل الرياضي",                     credits: 3, required_room_type: "Lecture Hall", min_level: 2 },
  { code: "ر241",  title: "المعادلات التفاضلية العادية",               credits: 3, required_room_type: "Lecture Hall", min_level: 2 },
  { code: "ر271",  title: "الميكانيكا النيوتونية (2)",                 credits: 3, required_room_type: "Lecture Hall", min_level: 2 },
  { code: "ر272",  title: "الميكانيكا التحليلية",                      credits: 3, required_room_type: "Lecture Hall", min_level: 2 },
  { code: "ص201",  title: "مقدمة نظرية الاحتمالات",                   credits: 3, required_room_type: "Lecture Hall", min_level: 2 },
  { code: "س201",  title: "البرمجة الموجهة",                          credits: 3, required_room_type: "Lab",          min_level: 2 },
  { code: "س202",  title: "هياكل البيانات والخوارزميات",               credits: 3, required_room_type: "Lab",          min_level: 2 },
  // السنة 3
  { code: "ره305", title: "المنطق الرياضي والجبر البولياني (1)",       credits: 3, required_room_type: "Lecture Hall", min_level: 3 },
  { code: "ر306",  title: "المنطق الرياضي والجبر البولياني (2)",       credits: 3, required_room_type: "Lecture Hall", min_level: 3 },
  { code: "ر311",  title: "الجبر المجرد (1)",                         credits: 3, required_room_type: "Lecture Hall", min_level: 3 },
  { code: "ر331",  title: "التحليل الحقيقي (1)",                      credits: 3, required_room_type: "Lecture Hall", min_level: 3 },
  { code: "ر332",  title: "التحليل الحقيقي (2)",                      credits: 3, required_room_type: "Lecture Hall", min_level: 3 },
  { code: "ر351",  title: "التحليل العددي (1)",                       credits: 3, required_room_type: "Lecture Hall", min_level: 3 },
  { code: "س303",  title: "تطوير البرمجيات",                          credits: 3, required_room_type: "Lab",          min_level: 3 },
  { code: "س305",  title: "تحليل وتصميم خوارزميات",                   credits: 3, required_room_type: "Lecture Hall", min_level: 3 },
  { code: "س306",  title: "نظم تشغيل الحاسب",                         credits: 3, required_room_type: "Lab",          min_level: 3 },
  { code: "س307",  title: "نظم قواعد البيانات",                       credits: 3, required_room_type: "Lab",          min_level: 3 },
  { code: "س308",  title: "تصميم قواعد البيانات",                     credits: 3, required_room_type: "Lab",          min_level: 3 },
  { code: "س309",  title: "تحليل وتصميم نظم",                         credits: 3, required_room_type: "Lecture Hall", min_level: 3 },
  { code: "س317",  title: "النظم الموزعة",                            credits: 3, required_room_type: "Lab",          min_level: 3 },
  // السنة 4
  { code: "ر411",  title: "نظرية الأعداد",                            credits: 3, required_room_type: "Lecture Hall", min_level: 4 },
  { code: "ر441",  title: "المعادلات التفاضلية الجزئية (1)",           credits: 3, required_room_type: "Lecture Hall", min_level: 4 },
  { code: "ر451",  title: "الحلول العددية للمعادلات التفاضلية الجزئية",credits: 3, required_room_type: "Lecture Hall", min_level: 4 },
  { code: "ر475",  title: "ديناميكا الموائع الحسابية (1)",             credits: 3, required_room_type: "Lecture Hall", min_level: 4 },
  { code: "ر477",  title: "نظرية المرونة (1)",                        credits: 3, required_room_type: "Lecture Hall", min_level: 4 },
  { code: "ر481",  title: "نظرية التحكم الأمثل (1)",                  credits: 3, required_room_type: "Lecture Hall", min_level: 4 },
  { code: "س401",  title: "شبكات الحاسب",                             credits: 3, required_room_type: "Lab",          min_level: 4 },
  { code: "س402",  title: "نظرية التشفير",                            credits: 3, required_room_type: "Lecture Hall", min_level: 4 },
  { code: "س403",  title: "الأتوماتيكية واللغات الشكلية",              credits: 3, required_room_type: "Lecture Hall", min_level: 4 },
  { code: "س406",  title: "المحاكاة والنمذجة",                        credits: 3, required_room_type: "Lab",          min_level: 4 },
  { code: "س407",  title: "تصميم لغات البرمجة",                       credits: 3, required_room_type: "Lab",          min_level: 4 },
  { code: "س408",  title: "الذكاء الاصطناعي",                         credits: 3, required_room_type: "Lab",          min_level: 4 },
  { code: "س415",  title: "نظم المعلومات الإدارية",                   credits: 3, required_room_type: "Lecture Hall", min_level: 4 },
  { code: "س417",  title: "الشبكات العصبية",                          credits: 3, required_room_type: "Lab",          min_level: 4 },
  { code: "س427",  title: "لغات برمجة مختارة",                        credits: 3, required_room_type: "Lab",          min_level: 4 },
];

// ============================================================
// STUDY PLANS - خطط دراسية للأقسام الثلاثة
// semester_num: 2 = الفصل الثاني (التيرم الحالي)
// ============================================================

// رياضيات / علوم حاسب - الفصل الثاني من كل سنة
const mathCSPlan = [
  // السنة 1 - الفصل الثاني
  { code: "ر132",  year: 1, sem: 2, type: "إجباري" },
  { code: "ر170",  year: 1, sem: 2, type: "إجباري" },
  { code: "س101",  year: 1, sem: 2, type: "إجباري" },
  { code: "ف102",  year: 1, sem: 2, type: "إجباري" },
  { code: "ك102",  year: 1, sem: 2, type: "إجباري" },
  // السنة 2 - الفصل الثاني
  { code: "ر212",  year: 2, sem: 2, type: "إجباري" },
  { code: "ر213",  year: 2, sem: 2, type: "إجباري" },
  { code: "ر232",  year: 2, sem: 2, type: "إجباري" },
  { code: "ر241",  year: 2, sem: 2, type: "إجباري" },
  { code: "ر272",  year: 2, sem: 2, type: "إجباري" },
  { code: "س202",  year: 2, sem: 2, type: "إجباري" },
  // السنة 3 - الفصل الثاني
  { code: "ر306",  year: 3, sem: 2, type: "إجباري" },
  { code: "ر311",  year: 3, sem: 2, type: "إجباري" },
  { code: "ر332",  year: 3, sem: 2, type: "إجباري" },
  { code: "س303",  year: 3, sem: 2, type: "إجباري" },
  { code: "س306",  year: 3, sem: 2, type: "إجباري" },
  { code: "س308",  year: 3, sem: 2, type: "إجباري" },
  // السنة 4 - الفصل الثاني
  { code: "ر451",  year: 4, sem: 2, type: "إجباري" },
  { code: "س402",  year: 4, sem: 2, type: "إجباري" },
  { code: "س407",  year: 4, sem: 2, type: "إجباري" },
  { code: "س408",  year: 4, sem: 2, type: "إجباري" },
  // اختياري س4 فصل2
  { code: "ر441",  year: 4, sem: 2, type: "اختياري" },
  { code: "ر475",  year: 4, sem: 2, type: "اختياري" },
  { code: "ر477",  year: 4, sem: 2, type: "اختياري" },
  { code: "ر481",  year: 4, sem: 2, type: "اختياري" },
  { code: "س406",  year: 4, sem: 2, type: "اختياري" },
  { code: "س415",  year: 4, sem: 2, type: "اختياري" },
  { code: "س417",  year: 4, sem: 2, type: "اختياري" },
  { code: "س317",  year: 4, sem: 2, type: "اختياري" },
  { code: "س427",  year: 4, sem: 2, type: "اختياري" },
  // متطلبات جامعة
  { code: "U110",  year: 1, sem: 2, type: "إجباري" },
  { code: "U103",  year: 1, sem: 2, type: "إجباري" },
];

// علوم حاسب منفرد - الفصل الثاني من كل سنة
const csPlan = [
  // السنة 1 - الفصل الثاني
  { code: "ر132",  year: 1, sem: 2, type: "إجباري" },
  { code: "ر170",  year: 1, sem: 2, type: "إجباري" },
  { code: "س101",  year: 1, sem: 2, type: "إجباري" },
  { code: "ف102",  year: 1, sem: 2, type: "إجباري" },
  { code: "ك102",  year: 1, sem: 2, type: "إجباري" },
  // السنة 2 - الفصل الثاني
  { code: "ر212",  year: 2, sem: 2, type: "إجباري" },
  { code: "ر213",  year: 2, sem: 2, type: "إجباري" },
  { code: "ر232",  year: 2, sem: 2, type: "إجباري" },
  { code: "ر241",  year: 2, sem: 2, type: "إجباري" },
  { code: "ر272",  year: 2, sem: 2, type: "إجباري" },
  { code: "س202",  year: 2, sem: 2, type: "إجباري" },
  // السنة 3 - الفصل الثاني
  { code: "س303",  year: 3, sem: 2, type: "إجباري" },
  { code: "س306",  year: 3, sem: 2, type: "إجباري" },
  { code: "س308",  year: 3, sem: 2, type: "إجباري" },
  { code: "ر306",  year: 3, sem: 2, type: "اختياري" },
  { code: "ر332",  year: 3, sem: 2, type: "اختياري" },
  { code: "س317",  year: 3, sem: 2, type: "اختياري" },
  // السنة 4 - الفصل الثاني
  { code: "س402",  year: 4, sem: 2, type: "إجباري" },
  { code: "س407",  year: 4, sem: 2, type: "إجباري" },
  { code: "س408",  year: 4, sem: 2, type: "إجباري" },
  { code: "ر441",  year: 4, sem: 2, type: "اختياري" },
  { code: "ر475",  year: 4, sem: 2, type: "اختياري" },
  { code: "ر477",  year: 4, sem: 2, type: "اختياري" },
  { code: "ر481",  year: 4, sem: 2, type: "اختياري" },
  { code: "س406",  year: 4, sem: 2, type: "اختياري" },
  { code: "س415",  year: 4, sem: 2, type: "اختياري" },
  { code: "س417",  year: 4, sem: 2, type: "اختياري" },
  { code: "س427",  year: 4, sem: 2, type: "اختياري" },
  // متطلبات جامعة
  { code: "U110",  year: 1, sem: 2, type: "إجباري" },
  { code: "U103",  year: 1, sem: 2, type: "إجباري" },
];

// رياضيات منفرد - الفصل الثاني من كل سنة
const mathPlan = [
  // السنة 1 - الفصل الثاني
  { code: "ر132",  year: 1, sem: 2, type: "إجباري" },
  { code: "ر170",  year: 1, sem: 2, type: "إجباري" },
  { code: "س101",  year: 1, sem: 2, type: "إجباري" },
  { code: "ف102",  year: 1, sem: 2, type: "إجباري" },
  { code: "ك102",  year: 1, sem: 2, type: "إجباري" },
  // السنة 2 - الفصل الثاني
  { code: "ر212",  year: 2, sem: 2, type: "إجباري" },
  { code: "ر232",  year: 2, sem: 2, type: "إجباري" },
  { code: "ر241",  year: 2, sem: 2, type: "إجباري" },
  { code: "ر272",  year: 2, sem: 2, type: "إجباري" },
  { code: "ر213",  year: 2, sem: 2, type: "اختياري" },
  { code: "س202",  year: 2, sem: 2, type: "اختياري" },
  // السنة 3 - الفصل الثاني
  { code: "ر306",  year: 3, sem: 2, type: "إجباري" },
  { code: "ر311",  year: 3, sem: 2, type: "إجباري" },
  { code: "ر332",  year: 3, sem: 2, type: "إجباري" },
  { code: "س303",  year: 3, sem: 2, type: "اختياري" },
  { code: "س306",  year: 3, sem: 2, type: "اختياري" },
  { code: "س308",  year: 3, sem: 2, type: "اختياري" },
  // السنة 4 - الفصل الثاني
  { code: "ر451",  year: 4, sem: 2, type: "إجباري" },
  { code: "ر441",  year: 4, sem: 2, type: "اختياري" },
  { code: "ر475",  year: 4, sem: 2, type: "اختياري" },
  { code: "ر477",  year: 4, sem: 2, type: "اختياري" },
  { code: "ر481",  year: 4, sem: 2, type: "اختياري" },
  { code: "س406",  year: 4, sem: 2, type: "اختياري" },
  { code: "س415",  year: 4, sem: 2, type: "اختياري" },
  { code: "س417",  year: 4, sem: 2, type: "اختياري" },
  { code: "س427",  year: 4, sem: 2, type: "اختياري" },
  // متطلبات جامعة
  { code: "U110",  year: 1, sem: 2, type: "إجباري" },
  { code: "U103",  year: 1, sem: 2, type: "إجباري" },
];

// الفصل الأول - مشترك بين الأقسام الثلاثة
const sem1CommonPlan = [
  { code: "ر110",  year: 1, sem: 1, type: "إجباري" },
  { code: "ر131",  year: 1, sem: 1, type: "إجباري" },
  { code: "ص100",  year: 1, sem: 1, type: "إجباري" },
  { code: "ف101",  year: 1, sem: 1, type: "إجباري" },
  { code: "ك101",  year: 1, sem: 1, type: "إجباري" },
  { code: "ع101",  year: 1, sem: 1, type: "إجباري" },
  { code: "ع102",  year: 1, sem: 1, type: "إجباري" },
  // السنة 2 - الفصل الأول
  { code: "ر211",  year: 2, sem: 1, type: "إجباري" },
  { code: "ر231",  year: 2, sem: 1, type: "إجباري" },
  { code: "ر271",  year: 2, sem: 1, type: "إجباري" },
  { code: "س201",  year: 2, sem: 1, type: "إجباري" },
  { code: "ص201",  year: 2, sem: 1, type: "إجباري" },
  // السنة 3 - الفصل الأول
  { code: "ره305", year: 3, sem: 1, type: "إجباري" },
  { code: "ر331",  year: 3, sem: 1, type: "إجباري" },
  { code: "ر351",  year: 3, sem: 1, type: "إجباري" },
  { code: "س305",  year: 3, sem: 1, type: "إجباري" },
  { code: "س307",  year: 3, sem: 1, type: "إجباري" },
  { code: "س309",  year: 3, sem: 1, type: "إجباري" },
  // السنة 4 - الفصل الأول
  { code: "ر411",  year: 4, sem: 1, type: "إجباري" },
  { code: "ر481",  year: 4, sem: 1, type: "إجباري" },
  { code: "س401",  year: 4, sem: 1, type: "إجباري" },
  { code: "س403",  year: 4, sem: 1, type: "إجباري" },
  { code: "U111",  year: 2, sem: 1, type: "إجباري" },
];

// ============================================================
// ANNOUNCEMENTS SEED DATA
// ============================================================
const announcementsData = [
  // ── إعلانات أخبار ──────────────────────────────────────────
  {
    title: "تغيير مكان محاضرة مادة هياكل البيانات والخوارزميات",
    body: "نُعلم طلاب الفرقة الثانية بجميع الأقسام أنه اعتباراً من الأسبوع القادم سيتم تحويل محاضرة مادة هياكل البيانات والخوارزميات (س202) من قاعة A101 إلى قاعة D401. يُرجى الانتباه لهذا التغيير وعدم التأخر.",
    type: "news",
    status: "active",
    date: new Date("2025-04-10"),
  },
  {
    title: "تغيير موعد محاضرة مادة التفاضل والتكامل (2) - الفرقة الأولى",
    body: "يُخطر طلاب الفرقة الأولى بأن محاضرة مادة تفاضل وتكامل وهندسة تحليلية (2) ستُنقل من يوم الأحد الساعة 10:00 إلى يوم الاثنين الساعة 12:00 في نفس القاعة A102، وذلك بدءاً من هذا الأسبوع.",
    type: "news",
    status: "active",
    date: new Date("2025-04-08"),
  },
  {
    title: "إعلان نتائج الفاينل - الفصل الدراسي الأول 2024",
    body: "يسعد إدارة الكلية الإعلان عن اعتماد نتائج امتحانات نهاية الفصل الدراسي الأول للعام الجامعي 2024/2025. يمكن للطلاب الاطلاع على نتائجهم من خلال بوابة الطالب في قسم 'النتائج النهائية'. في حال وجود أي اعتراض يُرجى التواصل مع شئون الطلاب خلال أسبوعين من تاريخ الإعلان.",
    type: "news",
    status: "active",
    date: new Date("2025-03-20"),
  },
  {
    title: "بدء فترة التسجيل للفصل الدراسي الثاني 2025",
    body: "تُعلن إدارة الكلية عن فتح باب التسجيل للفصل الدراسي الثاني للعام الجامعي 2024/2025 اعتباراً من 25 يناير 2025. يُرجى من جميع الطلاب مراجعة المرشد الأكاديمي قبل التسجيل والتأكد من استيفاء المتطلبات السابقة لكل مادة.",
    type: "event",
    status: "active",
    date: new Date("2025-01-20"),
  },
  {
    title: "تعليق المحاضرات بمناسبة الإجازة الرسمية",
    body: "تُعلم إدارة الكلية بتعليق جميع المحاضرات والأنشطة الأكاديمية يومَي الأحد والاثنين القادمَين بمناسبة الإجازة الرسمية. تستأنف المحاضرات بشكل طبيعي اعتباراً من يوم الثلاثاء.",
    type: "news",
    status: "active",
    date: new Date("2025-04-14"),
  },

  // ── مستندات قابلة للتحميل ──────────────────────────────────
  {
    title: "استمارة إعادة رصد الدرجات",
    body: "يمكن للطلاب الراغبين في طلب إعادة رصد درجاتهم تحميل الاستمارة الرسمية وتعبئتها وتسليمها لشئون الطلاب خلال أسبوعين من إعلان النتائج. يُرفق مع الاستمارة صورة من كشف الدرجات.",
    type: "document",
    status: "active",
    date: new Date("2025-03-25"),
    fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf",
    fileSize: "245 KB",
  },
  {
    title: "استمارة التقدم للتدريب الميداني",
    body: "تُتاح استمارة التقدم لبرنامج التدريب الميداني الصيفي 2025 للطلاب المستوفين للشروط (اجتياز 90 ساعة معتمدة على الأقل). يُرجى تعبئة الاستمارة وإرفاق السيرة الذاتية وتسليمها لمكتب التدريب قبل 1 مايو 2025.",
    type: "document",
    status: "active",
    date: new Date("2025-04-01"),
    fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf",
    fileSize: "180 KB",
  },
  {
    title: "نموذج طلب تغيير المسار الدراسي",
    body: "يُتاح للطلاب الراغبين في تغيير مسارهم الدراسي (من قسم إلى آخر) تحميل النموذج الرسمي وتعبئته. يُشترط الحصول على موافقة المرشد الأكاديمي ورئيس القسم المنقول إليه. تُقبل الطلبات خلال الأسبوعين الأولين من كل فصل دراسي فقط.",
    type: "document",
    status: "active",
    date: new Date("2025-02-05"),
    fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf",
    fileSize: "210 KB",
  },
  {
    title: "نموذج طلب طرح مقرر لفصل دراسي آخر",
    body: "يمكن للطلاب الذين يرغبون في تأجيل تسجيل مقرر إجباري إلى فصل دراسي لاحق (لأسباب موجبة) تحميل هذا النموذج وتعبئته وتقديمه لشئون الطلاب مرفقاً بما يثبت العذر. يخضع الطلب لموافقة لجنة الدراسة.",
    type: "document",
    status: "active",
    date: new Date("2025-02-10"),
    fileUrl: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf",
    fileSize: "195 KB",
  },
];

// ============================================================
// MAIN SEED FUNCTION
// ============================================================
const seedDatabase = async () => {
  try {
    // 1. Permissions
    await Permission.deleteMany();
    const insertedPermissions = await Permission.insertMany(permissions);
    const permMap = Object.fromEntries(insertedPermissions.map((p) => [p.name, p._id]));
    console.log(`${insertedPermissions.length} Permissions created`);

    // 2. Roles
    await Role.deleteMany();
    const allPermIds = insertedPermissions.map((p) => p._id);
    const studentPermNames = ["view_courses", "view_sections", "view_enrollments", "create_enrollment", "manage_waitlist", "view_registration_slices", "view_grades"];
    const professorPermNames = ["view_courses", "view_sections", "view_enrollments", "view_grades", "manage_grades", "view_attendance", "manage_attendance", "assign_advisor"];

    const [superAdminRole, adminRole, professorRole, studentRole] = await Role.insertMany([
      { name: "super_admin", description: "Super Administrator", permissions: allPermIds },
      { name: "admin",       description: "Administrator",       permissions: allPermIds },
      { name: "professor",   description: "Professor",           permissions: professorPermNames.map((n) => permMap[n]).filter(Boolean) },
      { name: "student",     description: "Student",             permissions: studentPermNames.map((n) => permMap[n]).filter(Boolean) },
    ]);
    console.log("Roles created");

    // 3. Departments
    await Department.deleteMany();
    const departments = await Department.insertMany(departmentsData);
    const deptMap = Object.fromEntries(departments.map((d) => [d.code, d._id]));
    console.log(`${departments.length} Departments created`);

    // 4. Users
    await User.deleteMany();
    const users = [
      { firebaseUid: "super_admin_uid_001",        name: "Super Admin",      email: "superadmin@university.edu", role: superAdminRole._id, is_active: true },
      { firebaseUid: "n9FOIHlsn5hpt888Rf6NIx5EBLz1", name: "Nor Hsham",      email: "norhsham02@gmail.com",      role: superAdminRole._id, is_active: true },
      { firebaseUid: "admin_uid_001",              name: "Admin User",       email: "admin@university.edu",      role: adminRole._id,      is_active: true },
      { firebaseUid: "professor_uid_001",          name: "Dr. Ahmed Ali",    email: "ahmed@university.edu",      role: professorRole._id,  department: deptMap["MATH-CS"], is_active: true },
      { firebaseUid: "professor_uid_002",          name: "Dr. Sara Mohamed", email: "sara@university.edu",       role: professorRole._id,  department: deptMap["CS"],      is_active: true },
      { firebaseUid: "professor_uid_003",          name: "Dr. Karim Hassan", email: "karim@university.edu",      role: professorRole._id,  department: deptMap["MATH"],    is_active: true },
      { firebaseUid: "A0iYII0i8UfNQIVszDe6i993aDl1", name: "Hesham",         email: "hesham02@gmail.com",        role: studentRole._id,    department: deptMap["MATH-CS"], level: "1", studentId: "STU-2024-0010", is_active: true, isStudent: true },
      { firebaseUid: "student_uid_001",            name: "Student One",      email: "student1@university.edu",   role: studentRole._id,    department: deptMap["MATH-CS"], level: "1", studentId: "STU-2024-0001", is_active: true, isStudent: true },
      { firebaseUid: "student_uid_002",            name: "Student Two",      email: "student2@university.edu",   role: studentRole._id,    department: deptMap["CS"],      level: "2", studentId: "STU-2024-0002", is_active: true, isStudent: true },
      { firebaseUid: "student_uid_003",            name: "Student Three",    email: "student3@university.edu",   role: studentRole._id,    department: deptMap["MATH"],    level: "1", studentId: "STU-2024-0003", is_active: true, isStudent: true },
    ];
    await User.insertMany(users);
    console.log(`${users.length} Users created`);

    // 5. Rooms
    await Room.deleteMany();
    const roomsData = [
      { room_name: "A101", building_section: "A", type: "Lecture Hall", capacity: 80 },
      { room_name: "A102", building_section: "A", type: "Lecture Hall", capacity: 60 },
      { room_name: "A103", building_section: "A", type: "Lecture Hall", capacity: 100 },
      { room_name: "B201", building_section: "B", type: "Lab",          capacity: 30 },
      { room_name: "B202", building_section: "B", type: "Lab",          capacity: 30 },
      { room_name: "B203", building_section: "B", type: "Lab",          capacity: 40 },
      { room_name: "D401", building_section: "D", type: "Lecture Hall", capacity: 120 },
    ];
    const rooms = await Room.insertMany(roomsData);
    console.log(`${rooms.length} Rooms created`);

    // 6. Semesters
    await Semester.deleteMany();
    const semestersData = [
      { year: 2024, term: "Fall",   is_active: false, start_date: new Date("2024-09-01"), end_date: new Date("2024-12-20"), add_drop_start: new Date("2024-08-25"), add_drop_end: new Date("2024-09-15") },
      { year: 2025, term: "Spring", is_active: true,  start_date: new Date("2025-02-01"), end_date: new Date("2025-05-25"), add_drop_start: new Date("2025-01-25"), add_drop_end: new Date("2025-02-15") },
    ];
    const semesters = await Semester.insertMany(semestersData);
    const activeSemester = semesters.find((s) => s.is_active);
    console.log(`${semesters.length} Semesters created`);

    // 7. Courses - insert shared courses
    await Course.deleteMany();
    const insertedCourses = await Course.insertMany(sharedCourses);
    const courseMap = Object.fromEntries(insertedCourses.map((c) => [c.code, c._id]));
    console.log(`${insertedCourses.length} Courses created`);

    // 8. Study Plans
    await StudyPlan.deleteMany();
    const studyPlanEntries = [];

    const plansByDept = {
      "MATH-CS": [...sem1CommonPlan, ...mathCSPlan],
      "CS":      [...sem1CommonPlan, ...csPlan],
      "MATH":    [...sem1CommonPlan, ...mathPlan],
    };

    for (const [deptCode, plan] of Object.entries(plansByDept)) {
      const deptId = deptMap[deptCode];
      for (const entry of plan) {
        const courseId = courseMap[entry.code];
        if (!courseId) { console.warn(`Course not found: ${entry.code}`); continue; }
        studyPlanEntries.push({
          department: deptId,
          course: courseId,
          academic_year: entry.year,
          semester_num: entry.sem,
          course_type: entry.type,
        });
      }
    }

    await StudyPlan.insertMany(studyPlanEntries, { ordered: false }).catch(() => {});
    console.log(`${studyPlanEntries.length} StudyPlan entries created`);

    // 9. Sections - للتيرم الثاني (Spring 2025) فقط
    await Section.deleteMany();

    // مواد التيرم الثاني فقط (sem: 2) من كل الخطط
    const sem2CodesSet = new Set([
      ...mathCSPlan.map((e) => e.code),
      ...csPlan.map((e) => e.code),
      ...mathPlan.map((e) => e.code),
    ]);

    const sem2Courses = insertedCourses.filter((c) => sem2CodesSet.has(c.code));

    const professors = await User.find({ role: professorRole._id }).lean();
    const lectureRooms = rooms.filter((r) => r.type === "Lecture Hall");
    const labRooms     = rooms.filter((r) => r.type === "Lab");

    const days      = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
    const timeSlots = [["08:00","10:00"],["10:00","12:00"],["12:00","14:00"],["14:00","16:00"],["16:00","18:00"]];

    const sectionsToCreate = [];
    let slotIdx = 0;

    for (const course of sem2Courses) {
      const pool = course.required_room_type === "Lab" ? labRooms : lectureRooms;
      const roomPool = pool.length ? pool : rooms;

      for (let sectionNum = 1; sectionNum <= 2; sectionNum++) {
        const room       = roomPool[slotIdx % roomPool.length];
        const day        = days[slotIdx % days.length];
        const [st, et]   = timeSlots[Math.floor(slotIdx / days.length) % timeSlots.length];
        const instructor = professors[slotIdx % professors.length];

        sectionsToCreate.push({
          sectionNumber: sectionNum,
          course_id:     course._id,
          semester_id:   activeSemester._id,
          instructor_id: instructor._id,
          room_id:       room._id,
          day,
          start_time: st,
          end_time:   et,
          capacity:   40,
          status:     "Open",
        });
        slotIdx++;
      }
    }

    await Section.insertMany(sectionsToCreate);
    console.log(`${sectionsToCreate.length} Sections created for Spring 2025 (semester 2 courses only)`);

    // 10. Announcements
    await Announcement.deleteMany();
    // Get admin user to set as createdBy
    const adminUser = await User.findOne({ email: "admin@university.edu" }).lean();
    const annsWithCreator = announcementsData.map((a) => ({
      ...a,
      createdBy: adminUser?._id || null,
    }));
    const insertedAnns = await Announcement.insertMany(annsWithCreator);
    console.log(`${insertedAnns.length} Announcements created`);

    console.log("✅ Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Error seeding database:", error.message);
    throw error;
  }
};

module.exports = seedDatabase;
