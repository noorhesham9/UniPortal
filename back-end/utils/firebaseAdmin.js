const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = require("../uni-portal-64dc1-firebase-adminsdk-fbsvc-64bcc2e9bb.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;
