const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  getEmailByStudentId,
} = require('../controllers/authController');

const { requireAuth } = require('../middleware/requireAuth');
const { validate, loginSchema, registerSchema } = require('../middleware/validate');
const verifyTurnstile = require('../middleware/turnstile');
const User = require('../models/User');

router.post('/register', validate(registerSchema), verifyTurnstile, register);
router.post('/login',    validate(loginSchema),    verifyTurnstile, login);

// Token refresh — called automatically by the frontend when Firebase silently refreshes
// the ID token. No Turnstile needed since the user is already authenticated via cookie.
router.post('/refresh', requireAuth, login);
router.get('/logout', logout);
router.get('/me', requireAuth, getMe);
router.get('/student-email/:studentId', getEmailByStudentId);

// PATCH /auth/me — user updates their own profile info
router.patch('/me', requireAuth, async (req, res) => {
  try {
    const allowed = ['phone', 'address', 'fatherName', 'nationality',
      'homePhone', 'dateOfEnrollment', 'fatherJob', 'motherJob',
      'guardianName', 'guardianMobile'];

    // Build name from first + last if provided
    const updates = {};
    if (req.body.firstNameEn !== undefined || req.body.lastNameEn !== undefined) {
      const user = await User.findById(req.user._id).lean();
      const nameArr = (user.name || '').split(' ');
      const first = req.body.firstNameEn ?? nameArr[0] ?? '';
      const last  = req.body.lastNameEn  ?? nameArr.slice(1).join(' ') ?? '';
      updates.name = `${first} ${last}`.trim();
    }

    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const updated = await User.findByIdAndUpdate(req.user._id, updates, { new: true })
      .populate('role', 'name permissions')
      .populate('department', 'name code');

    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
