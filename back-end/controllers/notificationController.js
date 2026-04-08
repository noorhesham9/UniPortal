const User = require('../models/User');
const { sendPushNotification } = require('../services/notificationService');

exports.updateFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const userId = req.user._id;

        await User.findByIdAndUpdate(userId, { fcmToken });

        res.status(200).json({
            status: 'success',
            message: 'FCM Token updated successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message
        });
    }
};

// Send notification to one or more students
exports.sendAdvisorNotification = async (req, res) => {
    try {
        const { studentIds, title, body } = req.body;

        if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ status: 'error', message: 'studentIds array is required' });
        }
        if (!title || !body) {
            return res.status(400).json({ status: 'error', message: 'title and body are required' });
        }

        // Get FCM tokens for all selected students
        const students = await User.find(
            { _id: { $in: studentIds }, fcmToken: { $exists: true, $ne: null } },
            'name fcmToken'
        );

        if (students.length === 0) {
            return res.status(404).json({ status: 'error', message: 'No students with valid FCM tokens found' });
        }

        // Send to all in parallel
        const results = await Promise.allSettled(
            students.map((s) => sendPushNotification(s.fcmToken, title, body))
        );

        const sent = results.filter((r) => r.status === 'fulfilled').length;
        const failed = results.filter((r) => r.status === 'rejected').length;

        res.status(200).json({
            status: 'success',
            message: `Notification sent to ${sent} student(s)`,
            sent,
            failed,
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Get all students (for the advisor to pick from)
exports.getStudents = async (req, res) => {
    try {
        const students = await User.find({}, 'name studentId email department')
            .populate('role', 'name')
            .lean();

        const filtered = students.filter((s) => s.role?.name === 'student');

        res.status(200).json({ status: 'success', data: filtered });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};