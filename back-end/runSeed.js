const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const seedDatabase = require("./utils/seedDatabase");

dotenv.config({ path: path.join(__dirname, "config.env") });

let dbName = process.env.NODE_ENV === "production" ? "UNIPortal" : "UNIPortalDEV";

mongoose.connect(process.env.CONN_STR, { dbName }).then(async () => {
  console.log("DB Connection Successful, starting seed...");
  await seedDatabase();
  process.exit(0);
}).catch(err => {
  console.error("DB Connection failed:", err.message);
  process.exit(1);
});
