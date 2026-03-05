const admin = require('firebase-admin');

const path = require('path');

const serviceAccount = require(path.join(__dirname, '../uni-portal-64dc1-firebase-adminsdk-fbsvc-64bcc2e9bb.json'));

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const sendPushNotification = async (fcmToken, title, body, data = {}) => {
    const message = {
        notification: {
            title: title,
            body: body,
        },
        data: data,
        token: fcmToken,
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Successfully sent message:', response);
        return response;
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
};

module.exports = { sendPushNotification };