const express = require("express");
const router = express.Router();
const { requireAuth } = require("../middleware/requireAuth");
const { requirePermission } = require("../middleware/authorize");
const receiptController = require("../controllers/receiptController");

router.get("/", requireAuth, requirePermission("admin_allowed_ids"), receiptController.getAllReceipts);
router.patch("/:studentId/approve", requireAuth, requirePermission("admin_allowed_ids"), receiptController.approveReceipt);
router.patch("/:studentId/reject", requireAuth, requirePermission("admin_allowed_ids"), receiptController.rejectReceipt);
router.delete("/:studentId", requireAuth, requirePermission("admin_allowed_ids"), receiptController.deleteReceipt);

module.exports = router;
