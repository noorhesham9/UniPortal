// Simple health check endpoint for debugging
module.exports = (req, res) => {
  const envCheck = {
    NODE_ENV: process.env.NODE_ENV || "not set",
    CONN_STR: process.env.CONN_STR ? "✓ set" : "✗ missing",
    SECRET_STR: process.env.SECRET_STR ? "✓ set" : "✗ missing",
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID
      ? "✓ set"
      : "✗ missing",
    FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL
      ? "✓ set"
      : "✗ missing",
    FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY
      ? "✓ set"
      : "✗ missing",
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME
      ? "✓ set"
      : "✗ missing",
    FRONTEND_URL: process.env.FRONTEND_URL ? "✓ set" : "✗ missing",
  };

  const missingVars = Object.entries(envCheck)
    .filter(([key, value]) => value === "✗ missing")
    .map(([key]) => key);

  res.status(200).json({
    success: true,
    message: "Health check endpoint",
    timestamp: new Date().toISOString(),
    environment: envCheck,
    missingVariables: missingVars,
    warning:
      missingVars.length > 0
        ? `Missing ${missingVars.length} environment variable(s)`
        : "All critical environment variables are set",
  });
};
