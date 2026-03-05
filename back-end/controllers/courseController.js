const Course = require('../models/course.model');
const Semester = require('../models/Semester');
const Enrollment = require('../models/Enrollment');
const Section = require('../models/Section');

// جلب المواد المتاحة للطالب
// شروط: 
// 1. الترم يكون is_active = true
// 2. المادة تابعة لقسم الطالب
// 3. المادة مطابقة لمستوى الطالب
// 4. إخفاء المواد التي سجل فيها أو نجح فيها بالفعل
const getAvailableCourses = async (req, res) => {
    try {
        // التحقق من أن المستخدم موجود و يملك department و level
        if (!req.user || !req.user.department || !req.user.level) {
            return res.status(400).json({
                success: false,
                message: 'User must have department and level assigned'
            });
        }

        // البحث عن الترم الفعال
        const activeSemester = await Semester.findOne({ is_active: true });
        if (!activeSemester) {
            return res.status(404).json({
                success: false,
                message: 'No active semester found'
            });
        }

        // ========== الفلترة المتقدمة ==========
        // 1. جلب جميع التسجيلات الخاصة بالطالب (سواء معتمدة أو لم)
        const enrollments = await Enrollment.find({
            student: req.user._id
        }).populate({
            path: 'section',
            select: 'course_id'
        });

        // 2. استخراج جميع course_ids التي التسجيل فيها الطالب
        const enrolledCourseIds = enrollments
            .map(enrollment => enrollment.section?.course_id)
            .filter(courseId => courseId !== null && courseId !== undefined);

        // 3. جلب المواد المتاحة بناءً على الشروط الأساسية
        const availableCourses = await Course.find({
            department_id: req.user.department,  // تابعة لقسم الطالب
            level: req.user.level,                // مطابقة لمستوى الطالب
            is_activated: true,                   // المادة مفعلة
            _id: { $nin: enrolledCourseIds }      // استبعاد المواد المسجل فيها
        })
        .populate('department_id', 'name code')
        .sort({ code: 1 });

        return res.status(200).json({
            success: true,
            activeSemesterId: activeSemester._id,
            semester: {
                year: activeSemester.year,
                term: activeSemester.term,
                startDate: activeSemester.start_date,
                endDate: activeSemester.end_date
            },
            enrolledCoursesCount: enrolledCourseIds.length,
            availableCoursesCount: availableCourses.length,
            courses: availableCourses,
            info: {
                totalCourses: enrolledCourseIds.length + availableCourses.length,
                filteredOut: enrolledCourseIds.length
            }
        });

    } catch (error) {
        console.error('Error fetching available courses:', error);
        return res.status(500).json({
            success: false,
            message: 'Error fetching available courses',
            error: error.message
        });
    }
};

module.exports = {
    getAvailableCourses
};
