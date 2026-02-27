const mongoose = require("mongoose");

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
      enum: [
        "users",
        "courses",
        "sections",
        "enrollments",
        "departments",
        "roles",
        "grades",
        "attendance",
        "allowed_students",
        "admin",
      ],
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Permission", permissionSchema);
