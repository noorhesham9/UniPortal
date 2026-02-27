const admin = require("../utils/firebaseAdmin");
const User = require("../models/User");

exports.requireAuth = async (req, res, next) => {
  try {
    console.log(req.cookies.token);
    let token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated to access this route",
      });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    req.user = await User.findOne({ firebaseUid: decoded.uid })
      .populate({
        path: "role",
        populate: { path: "permissions" },
      })
      .populate("department");
    console.log(req.user);
    if (!req.user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!req.user.is_active) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};
