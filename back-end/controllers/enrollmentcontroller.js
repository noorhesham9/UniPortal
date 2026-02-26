const Enrollment = require('../models/Enrollment');

// Task 1: تسجيل طالب في سكشن
const createEnrollment = async (req, res) => {
try {
const { student, section } = req.body;

// تشيك لو الطالب مسجل في نفس السكشن قبل كده  
    const existingEnrollment = await Enrollment.findOne({ student, section });  
    if (existingEnrollment) {  
        return res.status(400).json({ message: 'Student already enrolled in this section' });  
    }  

    const enrollment = await Enrollment.create({ student, section });  
    res.status(201).json(enrollment);  
} catch (error) {  
    res.status(500).json({ message: error.message });  
}

};

// Task 3: الـ Advisor يوافق على التسجيل ويضيف notes
const approveEnrollment = async (req, res) => {
try {
const { id } = req.params;
const { advisor_notes } = req.body;

const enrollment = await Enrollment.findById(id);  
    if (!enrollment) {  
        return res.status(404).json({ message: 'Enrollment not found' });  
    }  

    enrollment.status = 'Approved';  
    enrollment.advisor_notes = advisor_notes || '';  
    await enrollment.save();  

    res.status(200).json(enrollment);  
} catch (error) {  
    res.status(500).json({ message: error.message });  
}

};

// Task 2: تحديث الدرجات مع التحقق من isGradeLocked
const updateGrades = async (req, res) => {
try {
const { id } = req.params;
const { grades_object } = req.body;

const enrollment = await Enrollment.findById(id);  
    if (!enrollment) {  
        return res.status(404).json({ message: 'Enrollment not found' });  
    }  

    if (enrollment.isGradeLocked) {  
        return res.status(400).json({ message: 'Grades are locked and cannot be modified' });  
    }  

    enrollment.grades_object = grades_object;  
    await enrollment.save();  

    res.status(200).json(enrollment);  
} catch (error) {  
    res.status(500).json({ message: error.message });  
}

};

// Task 4: Virtual field جيب الساعات المنجازه  للطالب عن طريق الـ 
const getCompletedHours = async (req, res) => {
try {
const { studentId } = req.params;

const enrollments = await Enrollment.find({   
        student: studentId,   
        status: 'Approved'   
    });  

    const totalHours = enrollments.reduce((total, enrollment) => {  
        return total + (enrollment.completed_hours || 0);  
    }, 0);  

    res.status(200).json({ totalCompletedHours: totalHours });  
} catch (error) {  
    res.status(500).json({ message: error.message });  
}

};

module.exports = {
createEnrollment,
approveEnrollment,
updateGrades,
getCompletedHours
};
