const axios = require("axios");

const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;

/**
 * Verifies Cloudflare Turnstile token from req.body.turnstileToken
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
const verifyTurnstile = async (req, res, next) => {
  if (!TURNSTILE_SECRET) {
    console.warn("[Turnstile] TURNSTILE_SECRET_KEY not set — skipping verification");
    return next();
  }

  const token = req.body.turnstileToken;
  if (!token) {
    return res.status(400).json({ success: false, message: "Turnstile token missing" });
  }

  try {
    const { data } = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      new URLSearchParams({
        secret:   TURNSTILE_SECRET,
        response: token,
        remoteip: req.ip,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (!data.success) {
      return res.status(403).json({
        success: false,
        message: "Turnstile verification failed.",
        // data["error-codes"] contains the reason — useful for debugging
        errors: data["error-codes"] || [],
      });
    }

    next();
  } catch (err) {
    console.error("[Turnstile] Verification error:", err.message);
    return res.status(500).json({ success: false, message: "Turnstile service unavailable" });
  }
};

module.exports = verifyTurnstile;
