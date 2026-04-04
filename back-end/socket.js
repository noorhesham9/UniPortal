const { Server } = require("socket.io");
const admin  = require("./utils/firebaseAdmin");
const User   = require("./models/User");
const jwt    = require("jsonwebtoken");
const cookie = require("cookie");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "http://localhost:8081",
  "https://your-university-domain.com",
];

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,  // required for cookies to be sent with the handshake
    },
  });

  // Auth middleware — mirrors requireAuth exactly:
  // 1. Check impersonation_token cookie first
  // 2. Fall back to Firebase token
  io.use(async (socket, next) => {
    try {
      // Parse cookies from the socket handshake headers
      const rawCookies = socket.handshake.headers.cookie || "";
      const cookies = cookie.parse(rawCookies);
      const impToken = cookies.impersonation_token;

      if (impToken) {
        try {
          const decoded = jwt.verify(impToken, process.env.SECRET_STR);
          const user = await User.findById(decoded.impersonatedUserId).select("_id name");
          if (user) {
            socket.userId        = String(user._id);
            socket.userName      = user.name;
            socket.isImpersonating = true;
            console.log(`[Socket] Impersonating "${user.name}" (${user._id})`);
            return next();
          }
        } catch (_) {
          // invalid/expired — fall through
        }
      }

      // Normal Firebase token path
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token"));

      const decoded = await admin.auth().verifyIdToken(token);
      const user = await User.findOne({ firebaseUid: decoded.uid }).select("_id name");
      if (!user) return next(new Error("User not found"));

      socket.userId   = String(user._id);
      socket.userName = user.name;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(socket.userId);
    console.log(`[Socket] User "${socket.userName}" (${socket.userId}) joined room`);
    socket.on("disconnect", () => {
      console.log(`[Socket] User "${socket.userName}" disconnected`);
    });
  });

  return io;
};

// Call this from controllers to push a message to a specific user
const emitToUser = (userId, event, payload) => {
  if (io) {
    const room = String(userId);
    const sockets = io.sockets.adapter.rooms.get(room);
    console.log(`[Socket] Emitting "${event}" to room "${room}" — ${sockets ? sockets.size : 0} socket(s) in room`);
    io.to(room).emit(event, payload);
  }
};

// Broadcast to all connected sockets (e.g. site-wide events)
const emitToAll = (event, payload) => {
  if (io) {
    io.emit(event, payload);
  }
};

module.exports = { initSocket, emitToUser, emitToAll };
