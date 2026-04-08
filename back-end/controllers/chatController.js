const Message = require("../models/Message");
const User    = require("../models/User");
const { uploadToCloudinary } = require("../utils/cloudinary");
const { emitToUser } = require("../socket");

const ALLOWED_MIME  = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// GET /chat/:userId  — full history (used on first open)
exports.getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const me = req.user._id;

    const messages = await Message.find({
      $or: [
        { sender: me, receiver: userId },
        { sender: userId, receiver: me },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender",   "name profilePhoto role")
      .populate("receiver", "name profilePhoto role");

    // Only mark as read if there are actually unread messages from the other person
    const hasUnread = messages.some(
      (m) => String(m.sender._id) === String(userId) && !m.isRead
    );
    if (hasUnread) {
      await Message.updateMany(
        { sender: userId, receiver: me, isRead: false },
        { isRead: true }
      );
    }

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /chat/send
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    if (!receiverId || !text?.trim()) {
      return res.status(400).json({ success: false, message: "receiverId and text are required" });
    }

    const message = await Message.create({
      sender:   req.user._id,
      receiver: receiverId,
      text:     text.trim(),
    });

    const populated = await message.populate([
      { path: "sender",   select: "name profilePhoto role" },
      { path: "receiver", select: "name profilePhoto role" },
    ]);

    // Push to receiver in real-time
    emitToUser(receiverId, "new_message", populated);

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /chat/send-file
exports.sendFile = async (req, res) => {
  try {
    const { receiverId } = req.body;
    if (!receiverId) return res.status(400).json({ success: false, message: "receiverId is required" });
    if (!req.file)   return res.status(400).json({ success: false, message: "No file uploaded" });

    if (!ALLOWED_MIME.includes(req.file.mimetype)) {
      return res.status(400).json({ success: false, message: "Only images (JPEG, PNG, WEBP) and PDFs are allowed" });
    }
    if (req.file.size > MAX_SIZE_BYTES) {
      return res.status(400).json({ success: false, message: "File exceeds 5 MB limit" });
    }

    const isImage = req.file.mimetype.startsWith("image/");
    const result  = await uploadToCloudinary(req.file.buffer, {
      folder:        "uni-portal/chat-files",
      resource_type: isImage ? "image" : "raw",
    });

    const message = await Message.create({
      sender:       req.user._id,
      receiver:     receiverId,
      fileUrl:      result.secure_url,
      filePublicId: result.public_id,
      fileName:     req.file.originalname,
      fileType:     isImage ? "image" : "pdf",
    });

    const populated = await message.populate([
      { path: "sender",   select: "name profilePhoto role" },
      { path: "receiver", select: "name profilePhoto role" },
    ]);

    // Push to receiver in real-time
    emitToUser(receiverId, "new_message", populated);

    res.status(201).json({ success: true, message: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /chat/advisor
exports.getMyAdvisor = async (req, res) => {
  try {
    const student = await User.findById(req.user._id)
      .populate({ path: "advisor", select: "name email profilePhoto role department", populate: { path: "department" } });

    if (!student.advisor) {
      return res.status(404).json({ success: false, message: "No advisor assigned yet" });
    }
    res.status(200).json({ success: true, advisor: student.advisor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /chat/students
exports.getMyStudents = async (req, res) => {
  try {
    const students = await User.find({ advisor: req.user._id })
      .populate("department", "name")
      .populate("role", "name")
      .select("name email studentId department level profilePhoto tuitionReceipts feesPaid is_active");

    res.status(200).json({ success: true, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /chat/unread
exports.getUnreadCounts = async (req, res) => {
  try {
    const counts = await Message.aggregate([
      { $match: { receiver: req.user._id, isRead: false } },
      { $group: { _id: "$sender", count: { $sum: 1 } } },
    ]);
    res.status(200).json({ success: true, counts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
