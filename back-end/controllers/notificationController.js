const User = require('../models/User');

exports.updateFcmToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        // المفروض اليوزر يكون موجود في الـ req بعد الـ protect middleware
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