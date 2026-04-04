const mongoose = require("mongoose");
const Course = require("./models/Course");
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
(async () => {
  await mongoose.connect(process.env.DATABASE_LOCAL || process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const codes = ["م170", "م271", "ر132", "ر131"];
  for (const code of codes) {
    const c = await Course.findOne({ code });
    console.log(code, c ? "FOUND" : "NOT FOUND", c ? c._id : "");
  }
  await mongoose.disconnect();
})();
