const Enrollment = require('../models/Enrollment');
const User = require('../models/User');
const { sendPushNotification } = require('../services/notificationService');// Task 1: تسجيل طالب في سكشن
const createEnrollment = async (req, res) => {
try {
const { student, section } = req.body;

// تشيك لو الطالب مسجل في نفس السكشن قبل كده  
    const existingEnrollment = await Enrollment.findOne({ student, section });  
    if (existingEnrollment) {  
        return res.status(400).json({ message: 'Student already enrolled in this section' });  
    }  

    const enrollment = await Enrollment.create({ student, section });  
    if (enrollment.status === 'Enrolled') {
    const studentUser = await User.findById(student);
    if (studentUser && studentUser.fcmToken) {
        await sendPushNotification(
            studentUser.fcmToken, 
            "!تم قبولك", 

            "تمت ترقيتك من قائمة الانتظار وأصبحت مسجلاً في السكشن الآن."
        );
    }
}
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
// إشعار ملاحظات المرشد (قبول أو رفض)
    const studentUser = await User.findById(enrollment.student);
    if (studentUser && studentUser.fcmToken) {
        const title = enrollment.status === 'Approved' ? "تم قبول جدولك" : "تنبيه من المرشد";
        const body = `ملاحظات المرشد: ${enrollment.advisor_notes || 'لا يوجد ملاحظات '}`;
        
        try {
            await sendPushNotification(studentUser.fcmToken, title, body);
        } catch (err) {
            console.log("Notification failed but data saved:", err.message);
        }
    }
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


// 1. طلب انضمام لقائمة الانتظار
const joinWaitlist = async (req, res) => {
    try {
        const { student, section } = req.body;
        const existing = await Enrollment.findOne({ student, section });
        if (existing) {
            return res.status(400).json({ message: 'You are already enrolled or in the waitlist for this section' });        }
        const enrollment = await Enrollment.create({ student, section, status: 'Waitlist' });
            res.status(201).json({ message: 'Added to waitlist successfully', enrollment });   
         } catch (error) {
         res.status(500).json({ message: error.message });
    }
};

// 2. الخروج من قائمة الانتظار
const leaveWaitlist = async (req, res) => {
    try {
        const { id } = req.params;
        const enrollment = await Enrollment.findById(id);
        if (!enrollment || enrollment.status !== 'Waitlist') {
        return res.status(404).json({ message: 'Record not found or student is not in waitlist' });        }
        await Enrollment.findByIdAndDelete(id);
        res.status(200).json({ message: 'Left waitlist successfully' }); 
       } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. جلب ترتيب الطالب الحالي
const getWaitlistRank = async (req, res) => {
    try {
        const { id } = req.params;
        const myEnrollment = await Enrollment.findById(id);
        if (!myEnrollment || myEnrollment.status !== 'Waitlist') {
        return res.status(404).json({ message: 'Student is not in waitlist' });        }
        const rank = await Enrollment.countDocuments({
            section: myEnrollment.section,
            status: 'Waitlist',
            createdAt: { $lt: myEnrollment.createdAt }
        });
        res.status(200).json({ rank: rank + 1 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = {
createEnrollment,
approveEnrollment,
updateGrades,
getCompletedHours,
joinWaitlist,  
leaveWaitlist,  
getWaitlistRank 
};
