const admin = require('firebase-admin');
const serviceAccount = require('../uni-portal-64dc1-firebase-adminsdk-fbsvc-48769f8d91.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = admin;