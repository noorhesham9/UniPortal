const GradeConfig = require("../models/GradeConfig");

// GET /api/v1/grade-config/:sectionId
exports.getConfig = async (req, res) => {
  try {
    const config = await GradeConfig.findOne({ section_id: req.params.sectionId });
    res.json({ success: true, config: config || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/v1/grade-config/:sectionId  (upsert)
exports.saveConfig = async (req, res) => {
  try {
    const { quizzes, year_work_max, final_max, attendance_max, midterm_max } = req.body;

    // Convert to numbers to avoid string concatenation
    const ywMax = parseFloat(year_work_max) || 40;
    const attMax = parseFloat(attendance_max) || 0;
    const midMax = parseFloat(midterm_max) || 0;

    // Validate totals
    const quizTotal = (quizzes || []).reduce((s, q) => s + (parseFloat(q.max) || 0), 0);
    const ywTotal = attMax + midMax + quizTotal;
    
    if (ywTotal > ywMax) {
      return res.status(400).json({
        success: false,
        message: `Breakdown total (${ywTotal}) exceeds year_work_max (${ywMax})`,
      });
    }

    const config = await GradeConfig.findOneAndUpdate(
      { section_id: req.params.sectionId },
      { 
        quizzes, 
        year_work_max: ywMax, 
        final_max: parseFloat(final_max) || 60, 
        attendance_max: attMax, 
        midterm_max: midMax 
      },
      { new: true, upsert: true, runValidators: true }
    );
    res.json({ success: true, config });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
