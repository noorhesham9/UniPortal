import { useEffect, useState } from "react";
import { FiBookOpen, FiInfo, FiStar } from "react-icons/fi";
import {
  createCourse,
  getAllCourses,
  getDepartments,
} from "../../../../services/CourseServices";
import "./CreateCourse.css";

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    department_id: "",
    code: "",
    title: "",
    credits: "",
    level: "",
    required_room_type: "",
    prerequisites_array: [],
    is_activated: true,
  });

  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchDepartments();
    fetchCourses();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await getAllCourses();
      setCourses(data.courses || []);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handlePrerequisitesChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      prerequisites_array: checked
        ? [...prev.prerequisites_array, value]
        : prev.prerequisites_array.filter((id) => id !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const dataToSend = {
        ...formData,
        credits: parseInt(formData.credits),
        level: parseInt(formData.level),
      };

      const response = await createCourse(dataToSend);
      setMessage("تم إنشاء الكورس بنجاح!");
      console.log("Created course:", response);
      // Reset form
      setFormData({
        department_id: "",
        code: "",
        title: "",
        credits: "",
        level: "",
        required_room_type: "",
        prerequisites_array: [],
        is_activated: true,
      });
    } catch (error) {
      setMessage(error.message || "حدث خطأ أثناء إنشاء الكورس");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course-container dark-bg">
      <div className="create-course-header">
        <h1> Create New Course </h1>
        <p className="subtitle">
          Enter the details below to register a new course in the academic
          catalog.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="create-course-form dark-card">
        {/* Basic Information Section */}
        <div className="section-title">
          <FiInfo className="section-icon" />
          <span>Basic Information</span>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="title">Course Name</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g. Data Structures"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="code">Course Code</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleInputChange}
              placeholder="E.g. CS102"
              required
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="department_id">Department (optional)</label>
            <select
              id="department_id"
              name="department_id"
              value={formData.department_id}
              onChange={handleInputChange}
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="credits">Credit Hours</label>
            <input
              type="number"
              id="credits"
              name="credits"
              value={formData.credits}
              onChange={handleInputChange}
              min="1"
              max="6"
              placeholder="3"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="level">Course Level</label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              required
            >
              <option value="">Level</option>
              {[...Array(4)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Level {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="required_room_type">Required Room Type</label>
          <select
            id="required_room_type"
            name="required_room_type"
            value={formData.required_room_type}
            onChange={handleInputChange}
            required
          >
            <option value="">Select Room Type</option>
            <option value="Lab">Lab</option>
            <option value="Lecture Hall">Lecture Hall</option>
            <option value="Tutorial">Tutorial</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="description">Course Description</label>
          <textarea
            id="description"
            name="description"
            placeholder="Detailed syllabus overview and learning objectives..."
            rows={3}
            style={{
              background: "hsla(0, 0%, 0%, 0.15)",
              color: "#aaa",
              border: "1px solid #303541",
            }}
          />
        </div>

        {/* Curriculum & Requirements Section */}
        <div className="section-title" style={{ marginTop: 32 }}>
          <FiBookOpen className="section-icon" />
          <span>Curriculum & Requirements</span>
        </div>
        <div className="form-group">
          <label>Prerequisites</label>
          <div className="prerequisites-select">
            <input
              type="text"
              className="prereq-search"
              placeholder="Search existing courses (e.g. CS101)..."
              style={{
                width: "100%",
                background: "hsla(0, 0%, 0%, 0.15)",
                color: "#aaa",
                border: "1px solid #303541",
              }}
            />
            <div className="prereq-tags">
              {courses
                .filter((c) => formData.prerequisites_array.includes(c._id))
                .map((course) => (
                  <span key={course._id} className="prereq-tag">
                    {course.code} - {course.title}{" "}
                    <span
                      className="remove-tag"
                      onClick={() =>
                        handlePrerequisitesChange({
                          target: { value: course._id, checked: false },
                        })
                      }
                    >
                      ×
                    </span>
                  </span>
                ))}
              {courses
                .filter((c) => !formData.prerequisites_array.includes(c._id))
                .map((course) => (
                  <span
                    key={course._id}
                    className="prereq-tag inactive"
                    onClick={() =>
                      handlePrerequisitesChange({
                        target: { value: course._id, checked: true },
                      })
                    }
                  >
                    {course.code}
                  </span>
                ))}
            </div>
          </div>
        </div>
        <div className="form-group core-requirement-toggle">
          <span className="core-icon">
            <FiStar />
          </span>
          <span>Core Requirement</span>
          <label className="switch">
            <input
              type="checkbox"
              name="is_activated"
              checked={formData.is_activated}
              onChange={handleInputChange}
            />
            <span className="slider round"></span>
          </label>
          <span className="core-desc">
            Mark this course as mandatory for graduation
          </span>
        </div>

        {message && (
          <div
            className={`message ${message.includes("نجاح") ? "success" : "error"}`}
          >
            {message}
          </div>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Creating..." : "Create Course"}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;
