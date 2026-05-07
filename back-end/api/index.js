// Vercel serverless function entry point
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({ path: "./config.env" });

// Database connection
let dbnamee;
if (process.env.NODE_ENV === "production") dbnamee = "UNIPortal";
else if (process.env.NODE_ENV === "development") dbnamee = "UNIPortalDEV";

// Connect to MongoDB (Vercel will cache this connection)
if (mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.CONN_STR, { dbName: dbnamee })
    .then(() => {
      console.log("DB Connection Successful");
    })
    .catch((err) => {
      console.error("DB Connection Error:", err);
    });
}

const app = require("../app");

module.exports = app;
