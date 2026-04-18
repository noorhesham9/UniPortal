const crypto = require("crypto");
const RegistrationRequest = require("../models/RegistrationRequest");
const AllowedStudent = require("../models/AllowedStudentModel");
const { cloudinary } = require("../utils/cloudinary");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: { rejectUnauthorized: false }, // avoid self-signed cert issues in dev
});

const sendVerificationEmail = async (toEmail, token, name) => {
  const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"University Portal" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Verify your email — University Portal",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Hello ${name},</h2>
        <p>You submitted a registration request. Please verify your email address to proceed.</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#f59e0b;color:#0d1b2a;border-radius:6px;text-decoration:none;font-weight:700">
          Verify Email
        </a>
        <p style="margin-top:16px;color:#666;font-size:13px">This link expires in 24 hours.</p>
      </div>
    `,
  });
};

// ── STEP 1: Student submits registration request ──────────────────────────────
// POST /api/v1/registration-requests
exports.submitRequest = async (req, res) => {
  try {
    const { studentId, nationalId, examSeatNumber, fullName, personalEmail } = req.body;

    // 1. Verify against AllowedStudent whitelist
    const allowed = await AllowedStudent.findOne({
      studentId:      studentId?.trim(),
      nationalId:     nationalId?.trim(),
      examSeatNumber: examSeatNumber?.trim(),
      isActive: true,
    });

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Your data does not match our records. Please contact the administration.",
      });
    }

    if (allowed.isRegistered) {
      return res.status(400).json({
        success: false,
        message: "This Student ID is already registered.",
      });
    }

    // 2. Check for duplicate pending request
    const existing = await RegistrationRequest.findOne({
      $or: [{ studentId }, { personalEmail: personalEmail?.toLowerCase() }],
      status: { $in: ["pending_email", "pending_approval"] },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A pending request already exists for this ID or email.",
      });
    }

    // 3. Upload ID card image to Cloudinary
    if (!req.file) {
      return res.status(400).json({ success: false, message: "ID card image is required." });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: "uni-portal/id-cards",
          resource_type: "image",
          type: "authenticated", // private — requires signed URL to view
        },
        (err, result) => (err ? reject(err) : resolve(result))
      );
      stream.end(req.file.buffer);
    });

    // 4. Generate email verification token
    const emailToken = crypto.randomBytes(32).toString("hex");
    const expires    = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // 5. Create request
    const request = await RegistrationRequest.create({
      studentId:           studentId.trim(),
      nationalId:          nationalId.trim(),
      examSeatNumber:      examSeatNumber.trim(),
      fullName:            fullName.trim(),
      personalEmail:       personalEmail.toLowerCase().trim(),
      idCardImageUrl:      uploadResult.secure_url,
      idCardImagePublicId: uploadResult.public_id,
      emailVerifyToken:    emailToken,
      emailVerifyExpires:  expires,
      status:              "pending_email",
    });

    // 6. Send verification email
    await sendVerificationEmail(personalEmail, emailToken, fullName);

    res.status(201).json({
      success: true,
      message: "Request submitted. Please check your email to verify your address.",
      requestId: request._id,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── STEP 2: Student clicks email verification link ────────────────────────────
// GET /api/v1/registration-requests/verify-email?token=xxx
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const request = await RegistrationRequest.findOne({
      emailVerifyToken:   token,
      emailVerifyExpires: { $gt: new Date() },
      status: "pending_email",
    });

    if (!request) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link.",
      });
    }

    request.emailVerified    = true;
    request.emailVerifyToken = undefined;
    request.emailVerifyExpires = undefined;
    request.status           = "pending_approval";
    await request.save();

    res.json({
      success: true,
      message: "Email verified. Your request is now pending admin approval.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── STEP 3: Admin lists all pending requests ──────────────────────────────────
// GET /api/v1/registration-requests  (admin only)
exports.getRequests = async (req, res) => {
  try {
    const { status = "pending_approval" } = req.query;
    const filter = status === "all" ? {} : { status };
    const requests = await RegistrationRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate("reviewedBy", "name")
      .lean();
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── STEP 4: Admin approves or rejects ─────────────────────────────────────────
// PATCH /api/v1/registration-requests/:id/review  (admin only)
exports.reviewRequest = async (req, res) => {
  try {
    const { action, adminNote } = req.body;
    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "action must be approve or reject" });
    }

    const request = await RegistrationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Request not found" });
    if (request.status !== "pending_approval") {
      return res.status(400).json({ success: false, message: "Request is not pending approval" });
    }

    request.status     = action === "approve" ? "approved" : "rejected";
    request.adminNote  = adminNote || "";
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();

    let activationLink = null;
    if (action === "approve") {
      // Generate secure activation token — valid for 3 days
      const token = crypto.randomBytes(40).toString("hex");
      request.activationToken   = token;
      request.activationExpires = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      activationLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/activate?token=${token}`;
    }

    await request.save();

    // Send email
    const subject = action === "approve"
      ? "Your registration has been approved — Activate your account"
      : "Your registration request was not approved";

    const body = action === "approve"
      ? `
        <h2>Congratulations, ${request.fullName}!</h2>
        <p>Your registration request has been approved. Click the button below to activate your account.</p>
        <p><strong>This link expires in 3 days.</strong></p>
        <a href="${activationLink}" style="display:inline-block;padding:12px 28px;background:#f59e0b;color:#0d1b2a;border-radius:6px;text-decoration:none;font-weight:700;margin:16px 0">
          Activate My Account
        </a>
        <p style="color:#666;font-size:12px">If the button doesn't work, copy this link: ${activationLink}</p>
      `
      : `
        <h2>Dear ${request.fullName},</h2>
        <p>Unfortunately your registration request was not approved.</p>
        ${adminNote ? `<p><strong>Reason:</strong> ${adminNote}</p>` : ""}
        <p>Please contact the administration for more information.</p>
      `;

    await transporter.sendMail({
      from: `"University Portal" <${process.env.EMAIL_USER}>`,
      to: request.personalEmail,
      subject,
      html: `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px">${body}</div>`,
    }).catch(() => {});

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── STEP 5a: Validate activation token ───────────────────────────────────────
// GET /api/v1/registration-requests/activate?token=xxx  (public)
exports.validateActivationToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return res.status(400).json({ success: false, message: "Token is required." });

    const request = await RegistrationRequest.findOne({
      activationToken:   token,
      activationExpires: { $gt: new Date() },
      status: "approved",
    }).select("fullName studentId activationExpires").lean();

    if (!request) {
      return res.status(400).json({
        success: false,
        message: "This activation link is invalid or has expired. Please contact administration.",
      });
    }

    res.json({
      success: true,
      fullName:  request.fullName,
      studentId: request.studentId,
      expiresAt: request.activationExpires,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── STEP 5b: Verify security challenge (last 4 digits of national ID) ─────────
// POST /api/v1/registration-requests/activate/verify-challenge  (public)
exports.verifyChallenge = async (req, res) => {
  try {
    const { token, last4 } = req.body;
    if (!token || !last4) {
      return res.status(400).json({ success: false, message: "Token and last4 are required." });
    }

    const request = await RegistrationRequest.findOne({
      activationToken:   token,
      activationExpires: { $gt: new Date() },
      status: "approved",
    });

    if (!request) {
      return res.status(400).json({ success: false, message: "Invalid or expired token." });
    }

    // Check if token is locked due to too many failed attempts
    if (request.challengeLockedUntil && request.challengeLockedUntil > new Date()) {
      const minutesLeft = Math.ceil((request.challengeLockedUntil - Date.now()) / 60000);
      return res.status(429).json({
        success: false,
        message: `Too many failed attempts. This activation link is locked for ${minutesLeft} more minute(s).`,
      });
    }

    const actualLast4 = request.nationalId.slice(-4);

    if (last4.trim() !== actualLast4) {
      // Increment attempts
      request.challengeAttempts = (request.challengeAttempts || 0) + 1;

      // Lock after 3 failed attempts for 1 hour
      if (request.challengeAttempts >= 3) {
        request.challengeLockedUntil = new Date(Date.now() + 60 * 60 * 1000);
        request.challengeAttempts    = 0; // reset counter after lock
        await request.save();
        return res.status(429).json({
          success: false,
          message: "Too many failed attempts. This activation link has been locked for 1 hour.",
        });
      }

      await request.save();
      const attemptsLeft = 3 - request.challengeAttempts;
      return res.status(403).json({
        success: false,
        message: `Incorrect. ${attemptsLeft} attempt(s) remaining before this link is locked.`,
      });
    }

    // Correct — reset attempts
    request.challengeAttempts    = 0;
    request.challengeLockedUntil = undefined;
    await request.save();

    res.json({ success: true, verified: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── STEP 5: Check if studentId is approved (called before Firebase register) ──
// GET /api/v1/registration-requests/check/:studentId  (public)
exports.checkApproval = async (req, res) => {
  try {
    const request = await RegistrationRequest.findOne({
      studentId: req.params.studentId,
    }).select("status fullName personalEmail adminNote").lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        approved: false,
        status: null,
        message: "No registration request found for this Student ID.",
      });
    }

    res.json({
      success: true,
      approved: request.status === "approved",
      status: request.status,
      fullName: request.fullName,
      personalEmail: request.personalEmail,
      adminNote: request.adminNote || "",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── STEP: Student cancels their own pending request ───────────────────────────
// DELETE /api/v1/registration-requests/cancel/:studentId  (public)
exports.cancelRequest = async (req, res) => {
  try {
    const request = await RegistrationRequest.findOne({
      studentId: req.params.studentId,
      status: { $in: ["pending_email", "pending_approval"] },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "No cancellable request found. Only pending requests can be cancelled.",
      });
    }

    // Delete ID card image from Cloudinary
    if (request.idCardImagePublicId) {
      const { cloudinary } = require("../utils/cloudinary");
      await cloudinary.uploader.destroy(request.idCardImagePublicId, { resource_type: "image" }).catch(() => {});
    }

    await request.deleteOne();

    res.json({
      success: true,
      message: "Request cancelled. You can now submit a new registration request.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Get signed URL for ID card image (valid 60 seconds) ───────────────
// GET /api/v1/registration-requests/:id/id-card-url  (admin only)
exports.getIdCardSignedUrl = async (req, res) => {
  try {
    const request = await RegistrationRequest.findById(req.params.id)
      .select("idCardImagePublicId")
      .lean();

    if (!request?.idCardImagePublicId) {
      return res.status(404).json({ success: false, message: "ID card not found." });
    }

    const { cloudinary } = require("../utils/cloudinary");

    // Generate signed URL valid for 60 seconds
    const signedUrl = cloudinary.utils.private_download_url(
      request.idCardImagePublicId,
      "jpg",
      {
        resource_type: "image",
        type: "authenticated",
        expires_at: Math.floor(Date.now() / 1000) + 60,
      }
    );

    res.json({ success: true, url: signedUrl, expiresIn: 60 });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
