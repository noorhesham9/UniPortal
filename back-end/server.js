const mongoose = require("mongoose");
const dotenv   = require("dotenv");
const seedDatabase = require("./utils/seedDatabase");

dotenv.config({ path: "./config.env" });

process.on("uncaughtException", (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});

let dbnamee;
if (process.env.NODE_ENV === "production")  dbnamee = "UNIPortal";
else if (process.env.NODE_ENV === "development") dbnamee = "UNIPortalDEV";

const app = require("./app");
const http = require("http");
const { initSocket } = require("./socket");

const server = http.createServer(app);

// Attach Socket.io to the same HTTP server
initSocket(server);

mongoose.connect(process.env.CONN_STR, { dbName: dbnamee }).then(() => {
  console.log("DB Connection Successful");
  // seedDatabase();
});

const port = process.env.PORT || 3100;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name, err.message);
  server.close(() => process.exit(1));
});
