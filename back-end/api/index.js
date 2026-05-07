// Vercel serverless function entry point
const mongoose = require("mongoose");
const path = require("path");

// Only load dotenv in non-production (Vercel sets env vars directly)
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: path.join(__dirname, "..", "config.env") });
}

// Validate required environment variables
const requiredEnvVars = ["CONN_STR", "SECRET_STR"];
const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName],
);

if (missingEnvVars.length > 0) {
  console.error(
    "Missing required environment variables:",
    missingEnvVars.join(", "),
  );
  console.error(
    "Please set these in Vercel Dashboard → Settings → Environment Variables",
  );
}

// Database connection
const dbnamee =
  process.env.NODE_ENV === "production" ? "UNIPortal" : "UNIPortalDEV";

// Connect to MongoDB with connection caching
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  try {
    if (!process.env.CONN_STR) {
      throw new Error("CONN_STR environment variable is not set");
    }

    await mongoose.connect(process.env.CONN_STR, {
      dbName: dbnamee,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    cachedDb = mongoose.connection;
    console.log(`✓ DB Connection Successful (${dbnamee})`);
    return cachedDb;
  } catch (err) {
    console.error("✗ DB Connection Error:", err.message);
    // Don't throw - let the app start anyway, individual requests will fail
    return null;
  }
}

// Initialize connection (non-blocking)
connectToDatabase();

// Load the Express app
let app;
try {
  app = require("../app");
  console.log("✓ Express app loaded successfully");
} catch (err) {
  console.error("✗ Failed to load Express app:", err.message);
  console.error(err.stack);

  // Create a minimal error app
  const express = require("express");
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      success: false,
      error: "Server initialization failed",
      message: err.message,
      hint: "Check Vercel logs for details",
    });
  });
}

module.exports = app;
