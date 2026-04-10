const mongoose = require("mongoose");
const dotenv = require("dotenv");
const seedDatabase = require("./utils/seedDatabase");

dotenv.config({ path: "./config.env" });

let dbName = process.env.NODE_ENV === "production" ? "UNIPortal" : "UNIPortalDEV";

mongoose.connect(process.env.CONN_STR, { dbName }).then(async () => {
  console.log("DB Connection Successful, starting seed...");
  await seedDatabase();
  process.exit(0);
}).catch(err => {
  console.error("DB Connection failed:", err.message);
  process.exit(1);
});
