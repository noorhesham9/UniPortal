const admin = require("firebase-admin");

if (!admin.apps.length) {
  // Use environment variables in production (Vercel)
  // Use local file in development
  let credential;

  if (process.env.FIREBASE_PRIVATE_KEY) {
    // Production: Use environment variables
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    });
  } else {
    // Development: Use local JSON file
    const serviceAccount = require("../uni-portal-64dc1-firebase-adminsdk-fbsvc-64bcc2e9bb.json");
    credential = admin.credential.cert(serviceAccount);
  }

  admin.initializeApp({
    credential: credential,
  });
}

module.exports = admin;
