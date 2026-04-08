const mongoose = require("mongoose");

const sliceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },

    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },

    departments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
    levels: [String],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    min_gpa: { type: Number, default: 0 },
    max_gpa: { type: Number, default: 5 },

    is_active: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Ensure only one slice is active at a time
sliceSchema.pre("save", async function () {
  if (this.is_active && this.isModified("is_active")) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, is_active: true },
      { is_active: false }
    );
  }
});

sliceSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate();
  if (update && update.is_active === true) {
    const filter = this.getFilter();
    await this.model.updateMany(
      { _id: { $ne: filter._id }, is_active: true },
      { is_active: false }
    );
  }
});

module.exports = mongoose.model("RegistrationSlice", sliceSchema);
