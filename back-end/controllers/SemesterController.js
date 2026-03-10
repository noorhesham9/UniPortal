const Semester = require('../models/Semester');

const getAllSemesters = async (req, res) => {
    try {
        const semesters = await Semester.find();
        res.status(200).json(semesters);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getSemesterById = async (req, res) => {
    try {
        const semester = await Semester.findById(req.params.id);
        if (!semester) {
            return res.status(404).json({ message: 'Semester not found' });
        }
        res.status(200).json(semester);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSemester = async (req, res) => {
    try {
        const semester = await Semester.create(req.body);
        res.status(201).json(semester);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateSemester = async (req, res) => {
    try {
        const semester = await Semester.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!semester) {
            return res.status(404).json({ message: 'Semester not found' });
        }
        res.status(200).json(semester);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteSemester = async (req, res) => {
    try {
        const semester = await Semester.findByIdAndDelete(req.params.id);
        if (!semester) {
            return res.status(404).json({ message: 'Semester not found' });
        }
        res.status(200).json({ message: 'Semester deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllSemesters,
    getSemesterById,
    createSemester,
    updateSemester,
    deleteSemester
};