const User = require("../models/User");
const Role = require("../models/Role");
const admin = require("../utils/firebaseAdmin");
const AllowedStudentModel = require("../models/AllowedStudentModel");

exports.register = async (req, res) => {
  try {
    const { idToken, studentId, name } = req.body;

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;
    const allowed = await AllowedStudentModel.findOne({
      studentId: studentId,
      isActive: true,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "This Student ID is not authorized by Admin or deactivated.",
      });
    }

    const existingUser = await User.findOne({ studentId: studentId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This Student ID is already linked to another account.",
      });
    }
    const studentRole = await Role.findOne({ name: "student" });

    const newUser = await User.create({
      firebaseUid: firebaseUid,
      email: decodedToken.email,
      name: name || decodedToken.name,
      role: studentRole._id,
      studentId: studentId,
      is_active: true,
    });

    res.status(201).json({
      success: true,
      message: "User created in DB successfully",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    console.log("Login request received with body:", req.body);
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const user = await User.findOne({ firebaseUid: decodedToken.uid }).populate(
      "role",
    );

    if (!user) {
      return res.status(404).json({
        code: "auth/user-not-found",
        success: false,
        message: "No account found in our records. Please register first.",
      });
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    res.cookie("token", idToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid Token" });
  }
};

exports.logout = (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: false,
    maxAge: 0,
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: "role",
        populate: { path: "permissions" },
      })
      .populate("department");

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
