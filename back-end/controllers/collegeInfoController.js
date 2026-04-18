const CollegeInfo = require("../models/CollegeInfo");

// Always one document — upsert pattern
const getOrCreate = () =>
  CollegeInfo.findOne().then((doc) => doc || CollegeInfo.create({}));

// PUBLIC
exports.getCollegeInfo = async (req, res) => {
  try {
    const info = await getOrCreate();
    res.json({ success: true, info });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN
exports.updateCollegeInfo = async (req, res) => {
  try {
    const info = await getOrCreate();
    Object.assign(info, req.body);
    await info.save();
    res.json({ success: true, info });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
