const admin = require("firebase-admin");
const serviceAccount = require("../uni-portal-64dc1-firebase-adminsdk-fbsvc-64bcc2e9bb.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
