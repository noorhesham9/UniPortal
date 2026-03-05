const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/university', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  faculty: String
});
const Department = mongoose.model('Department', departmentSchema);

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: String,
  department_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  level: Number
});
const Student = mongoose.model('Student', studentSchema);

app.get('/api/departments', async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('department_id', 'name');
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));