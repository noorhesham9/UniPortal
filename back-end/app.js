const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const cookiesMiddleware = require("universal-cookie-express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const globalErrorHandler = require("./utils/errorHandler");

// Global limiter — 200 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS", // ignore CORS preflight
  message: { success: false, message: "Too many requests, please try again later." },
});

// Auth limiter — only counts actual POST attempts, not preflight
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS",
  message: { success: false, message: "Too many login attempts, please try again later." },
});
const adminRoute = require("./Routes/adminRoute");
const notificationRouter = require("./Routes/notificationRoutes");

let app = express();
app.use(helmet());
// Suppress xr-spatial-tracking warning from Turnstile iframe
app.use((req, res, next) => {
  res.setHeader("Permissions-Policy", "xr-spatial-tracking=()");
  next();
});
app.use(express.json());
app.use(globalLimiter);
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
app.use("/api/v1/auth", authLimiter, authRouter);
app.use("/api/v1/enrollment", enrollmentRoutes);
app.use("/api/v1/sections", sectionRoutes);
app.use("/api/v1/rooms", require("./Routes/roomRoutes"));
app.use(
  "/api/v1/registration-slices",
  require("./Routes/registrationSliceRoutes"),
);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/departments", require("./Routes/departmentRoutes"));
app.use("/api/v1/study-plan", require("./Routes/studyPlanRoutes"));
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/announcements", require("./Routes/announcementRoutes"));
app.use("/api/v1/public/departments", require("./Routes/publicDepartmentRoutes"));
app.use("/api/v1/college-info", require("./Routes/collegeInfoRoutes"));
app.use("/api/v1/grades", require("./Routes/gradesRoutes"));
app.use("/api/v1/grade-config", require("./Routes/gradeConfigRoutes"));
app.use("/api/v1/registration-requests", require("./Routes/registrationRequestRoutes"));
app.use("/api/v1/upload", require("./Routes/uploadRoutes"));
app.use("/api/v1/chat", require("./Routes/chatRoutes"));
app.use("/api/v1/receipts", require("./Routes/receiptRoutes"));
app.use("/api/notifications", notificationRouter);
app.use("/api/v1/notifications", notificationRouter);
app.all(/(.*)/, (req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found",
  });
});
app.use(globalErrorHandler);

// app.use(express.static("public"));

module.exports = app;
