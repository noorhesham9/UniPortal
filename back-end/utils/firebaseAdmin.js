const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

if (!admin.apps.length) {
  // Use environment variables in production (Vercel)
  // Use local file in development
  let credential;

  if (process.env.FIREBASE_PRIVATE_KEY) {
    // Production: Use environment variables
    console.log("✓ Using Firebase credentials from environment variables");
    credential = admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    });
  } else {
    // Development: Use local JSON file
    const serviceAccountPath = path.join(
      __dirname,
      "..",
      "uni-portal-64dc1-firebase-adminsdk-fbsvc-64bcc2e9bb.json",
    );

    if (fs.existsSync(serviceAccountPath)) {
      console.log("✓ Using Firebase credentials from local JSON file");
      const serviceAccount = require(serviceAccountPath);
      credential = admin.credential.cert(serviceAccount);
    } else {
      console.error("✗ Firebase credentials not found!");
      console.error(
        "Please set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY environment variables",
      );
      throw new Error(
        "Firebase credentials not configured. Set environment variables in Vercel Dashboard.",
      );
    }
  }

  admin.initializeApp({
    credential: credential,
  });

  console.log("✓ Firebase Admin initialized successfully");
}

module.exports = admin;
