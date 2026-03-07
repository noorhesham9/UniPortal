const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cookiesMiddleware = require("universal-cookie-express");
const globalErrorHandler = require("./utils/errorHandler");
const adminRoute = require("./Routes/adminRoute");
const notificationRouter = require("./Routes/notificationRoutes");

let app = express();
app.use(express.json());
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
const enrollmentRoutes = require("./Routes/enrollmentRoutes");
const sectionRoutes = require("./Routes/sectionRoutes");
const semesterRoutes = require("./Routes/SemesterRoutes");
const courseRoutes = require("./Routes/courseRoutes");
const authRouter = require("./Routes/authRoutes");
app.use(cookiesMiddleware());
app.use(express.static("./public"));
app.use(cookieParser());
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://your-university-domain.com",
  "http://localhost:8081",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use("/api/v1/home", (req, res, next) => {
  res.json("success");
});
app.use("/api/v1/semesters", semesterRoutes);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/enrollment", enrollmentRoutes);
app.use("/api/v1/sections", sectionRoutes);
app.use("/api/v1/rooms", require("./Routes/roomRoutes"));
app.use(
  "/api/v1/registration-slices",
  require("./Routes/registrationSliceRoutes"),
);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/admin", adminRoute);
app.use("/api/notifications", notificationRouter);
app.all(/(.*)/, (req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});
app.use(globalErrorHandler);

// app.use(express.static("public"));

module.exports = app;
