const User = require("../models/User");
const Role = require("../models/Role");
const admin = require("../utils/firebaseAdmin");
const AllowedStudentModel = require("../models/AllowedStudentModel");
const RegistrationRequest = require("../models/RegistrationRequest");

exports.register = async (req, res) => {
  try {
    const { idToken, activationToken, last4 } = req.body;

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid  = decodedToken.uid;

    // 1. Find request by activation token
    const regRequest = await RegistrationRequest.findOne({
      activationToken,
      activationExpires: { $gt: new Date() },
      status: "approved",
    });

    if (!regRequest) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired activation link. Please contact administration.",
      });
    }

    // 2. Re-verify security challenge
    const actualLast4 = regRequest.nationalId.slice(-4);
    if (last4?.trim() !== actualLast4) {
      return res.status(403).json({
        success: false,
        message: "Security challenge failed.",
      });
    }

    // 3. Check not already registered — also verify AllowedStudent.isRegistered
    const existingUser = await User.findOne({ studentId: regRequest.studentId });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "This Student ID is already linked to an account.",
      });
    }

    const allowedRecord = await AllowedStudentModel.findOne({ studentId: regRequest.studentId });
    if (allowedRecord?.isRegistered) {
      return res.status(400).json({
        success: false,
        message: "This Student ID has already been registered.",
      });
    }

    const studentRole = await Role.findOne({ name: "student" });

    const newUser = await User.create({
      firebaseUid,
      email:     decodedToken.email,
      name:      regRequest.fullName,
      role:      studentRole._id,
      studentId: regRequest.studentId,
      is_active: true,
      isStudent: true,
    });

    // 5. Mark as registered — invalidate token
    await AllowedStudentModel.findOneAndUpdate(
      { studentId: regRequest.studentId },
      { isRegistered: true }
    );

    regRequest.firebaseUid      = firebaseUid;
    regRequest.activationToken  = undefined;
    regRequest.activationExpires = undefined;
    await regRequest.save();

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: newUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    // console.log("Login request received with body:", req.body);
    const { idToken } = req.body;
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    const user = await User.findOne({ firebaseUid: decodedToken.uid })
      .populate({
        path: "role",
        populate: { path: "permissions" },
      })
      .populate("department");

    if (!user) {
      return res.status(404).json({
        code: "auth/user-not-found",
        success: false,
        message: "No account found in our records. Please register first.",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        code: "auth/user-inactive",
        success: false,
        message: "Your account has been deactivated. Please contact the Student Affairs office.",
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

// GET email by studentId — used for login with Student ID
exports.getEmailByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const user = await User.findOne({ studentId }).select("email").lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Student ID not found.",
      });
    }

    res.json({ success: true, email: user.email });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
