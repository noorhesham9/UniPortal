const mongoose = require("mongoose");
const dotenv = require("dotenv");
const seedDatabase = require("./utils/seedDatabase");

dotenv.config({ path: "./config.env" });
process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
let dbnamee;
if (process.env.NODE_ENV == "production") {
  dbnamee = "UNIPortal";
} else if (process.env.NODE_ENV == "development") {
  dbnamee = "UNIPortalDEV";
}

const app = require("./app");
mongoose.connect(process.env.CONN_STR, { dbName: dbnamee }).then((CONN) => {
  console.log("DB COnnection Successful");

  // seedDatabase();
});

const port = process.env.PORT;
console.log(process.env.PORT);
const server = app.listen(port, () => {
  console.log("server has started in port..." + `${port}`);
});
process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
