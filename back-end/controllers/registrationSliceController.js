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

exports.getMyEligibility = async (req, res) => {
  try {
    const now = new Date();
    const activeSlices = await RegistrationSlice.find({
      is_active: true,
      start_date: { $lte: now },
      end_date: { $gte: now },
    }).populate("departments", "name");

    // No active slice = registration closed
    if (activeSlices.length === 0) {
      return res.status(200).json({
        eligible: false,
        registrationClosed: true,
        slice: null,
        student: null,
        reasons: ["No active registration window at this time"],
      });
    }

    const user = req.user;
    const studentGpa = user.gpa ?? 0;
    const studentLevel = String(user.level);
    const studentDept = user.department;

    // Check if eligible for any active slice
    const eligible = activeSlices.some((slice) => {
      const inStudents = slice.students?.some((id) => id.equals(user._id));
      const inDepartment = slice.departments?.some((d) =>
        d._id.equals(studentDept),
      );
      const inLevel = slice.levels?.includes(studentLevel);
      const gpaOk = studentGpa >= slice.min_gpa && studentGpa <= slice.max_gpa;
      return (inStudents || inDepartment || inLevel) && gpaOk;
    });

    const slice = activeSlices[0];

    if (eligible) {
      return res.status(200).json({
        eligible: true,
        slice: {
          name: slice.name,
          start_date: slice.start_date,
          end_date: slice.end_date,
          min_gpa: slice.min_gpa,
          max_gpa: slice.max_gpa,
          levels: slice.levels,
          departments:
            slice.departments?.map((d) => ({ _id: d._id, name: d.name })) || [],
        },
        student: {
          gpa: studentGpa,
          department: user.department?.name || "Unknown",
          level: studentLevel,
        },
        reasons: [],
      });
    }

    // Not eligible - build reasons
    const reasons = [];
    if (studentGpa < slice.min_gpa || studentGpa > slice.max_gpa) {
      reasons.push(
        `Your GPA (${studentGpa.toFixed(2)}) is outside the allowed range (${slice.min_gpa} - ${slice.max_gpa})`,
      );
    }
    if (
      slice.departments?.length > 0 &&
      !slice.departments.some((d) => d._id.equals(studentDept))
    ) {
      reasons.push(
        `Your department is not included in this registration window`,
      );
    }
    if (slice.levels?.length > 0 && !slice.levels.includes(studentLevel)) {
      reasons.push(
        `Your level (${studentLevel}) is not included in this registration window`,
      );
    }
    if (
      slice.students?.length > 0 &&
      !slice.students.some((id) => id.equals(user._id))
    ) {
      reasons.push(`You are not in the specific student list for this window`);
    }

    return res.status(200).json({
      eligible: false,
      slice: {
        name: slice.name,
        start_date: slice.start_date,
        end_date: slice.end_date,
        min_gpa: slice.min_gpa,
        max_gpa: slice.max_gpa,
        levels: slice.levels,
        departments:
          slice.departments?.map((d) => ({ _id: d._id, name: d.name })) || [],
      },
      student: {
        gpa: studentGpa,
        department: user.department?.name || "Unknown",
        level: studentLevel,
      },
      reasons,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
