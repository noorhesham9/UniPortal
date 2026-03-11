const RegistrationSlice = require("../models/RegistrationSlice");

exports.createSlice = async (req, res) => {
  try {
    const slice = await RegistrationSlice.create(req.body);
    res.status(201).json(slice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listSlices = async (req, res) => {
  try {
    const slices = await RegistrationSlice.find().sort({ start_date: -1 });
    res.status(200).json(slices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateSlice = async (req, res) => {
  try {
    const { id } = req.params;
    const slice = await RegistrationSlice.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!slice) {
      return res.status(404).json({ message: "Slice not found" });
    }
    res.status(200).json(slice);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteSlice = async (req, res) => {
  try {
    const { id } = req.params;
    await RegistrationSlice.findByIdAndDelete(id);
    res.status(200).json({ message: "Slice removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
