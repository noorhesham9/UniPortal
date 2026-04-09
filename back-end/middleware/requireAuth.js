const admin = require("../utils/firebaseAdmin");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.requireAuth = async (req, res, next) => {
  try {
    // Check for active impersonation session first
    const impToken = req.cookies.impersonation_token;
    if (impToken) {
      try {
        const decoded = jwt.verify(impToken, process.env.SECRET_STR);
        req.user = await User.findById(decoded.impersonatedUserId)
          .populate({ path: "role", populate: { path: "permissions" } })
          .populate("department");
        req.isImpersonating = true;
        req.adminId = decoded.adminId;
        if (req.user) return next();
      } catch (_) {
        // invalid/expired impersonation token — fall through to normal auth
        res.clearCookie("impersonation_token");
      }
    }

    let token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated to access this route",
      });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = await User.findOne({ firebaseUid: decoded.uid })
      .populate({ path: "role", populate: { path: "permissions" } })
      .populate("department");

    if (!req.user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!req.user.is_active) {
      return res.status(403).json({ success: false, message: "User account is inactive" });
    }

    // Site lock — block students from all routes except /auth/me and /auth/logout
    if (process.env.SITE_LOCKED === "true" && req.user.role?.name === "student") {
      const allowed = ["/api/v1/auth/me", "/api/v1/auth/logout"];
      const isAllowed = allowed.some((path) => req.path === path || req.originalUrl.startsWith(path));
      if (!isAllowed) {
        return res.status(403).json({ success: false, message: "SITE_LOCKED", locked: true });
      }
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized to access this route" });
  }
};
