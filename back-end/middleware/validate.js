const { z } = require("zod");

// ── Schemas ──────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  idToken: z.string().min(1, "idToken is required"),
  turnstileToken: z.string().min(1, "Turnstile token is required"),
});

const registerSchema = z.object({
  idToken:         z.string().min(1, "idToken is required"),
  activationToken: z.string().min(1, "activationToken is required"),
  last4:           z.string().length(4, "last4 must be exactly 4 digits"),
  turnstileToken:  z.string().min(1, "Turnstile token is required"),
});

// ── Middleware factory ────────────────────────────────────────────────────────

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const issues = result.error.issues ?? result.error.errors ?? [];
    const errors = issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return res.status(400).json({ success: false, errors });
  }
  req.body = result.data;
  next();
};

module.exports = { validate, loginSchema, registerSchema };
