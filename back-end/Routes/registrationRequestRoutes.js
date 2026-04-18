const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/registrationRequestController");
const { requireAuth } = require("../middleware/requireAuth");
const { requireRole } = require("../middleware/authorize");
const multer  = require("multer");

const upload  = multer({ storage: multer.memoryStorage() });
const isAdmin = requireRole("admin", "super_admin");

// Public
router.post("/",                              upload.single("idCardImage"), ctrl.submitRequest);
router.get("/verify-email",                   ctrl.verifyEmail);
router.get("/activate",                       ctrl.validateActivationToken);
router.post("/activate/verify-challenge",     ctrl.verifyChallenge);
router.get("/check/:studentId",               ctrl.checkApproval);
router.get("/status/:studentId",              ctrl.checkApproval);
router.delete("/cancel/:studentId",           ctrl.cancelRequest);

// Admin only
router.get("/",                     requireAuth, isAdmin, ctrl.getRequests);
router.patch("/:id/review",         requireAuth, isAdmin, ctrl.reviewRequest);
router.get("/:id/id-card-url",      requireAuth, isAdmin, ctrl.getIdCardSignedUrl);

module.exports = router;
