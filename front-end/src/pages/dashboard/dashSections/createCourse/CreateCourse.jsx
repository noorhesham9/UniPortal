import { useEffect, useRef, useState } from "react";
import { FiBookOpen, FiInfo, FiSearch, FiStar } from "react-icons/fi";
import { createCourse, getAllCourses, getDepartments } from "../../../../services/CourseServices";
import "./CreateCourse.css";

const CreateCourse = () => {
  const [formData, setFormData] = useState({
    department_id: "", code: "", title: "", credits: "", level: "",
    required_room_type: "", prerequisites_array: [], is_activated: true,
  });
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [prereqSearch, setPrereqSearch] = useState("");
  const [prereqLoading, setPrereqLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    getDepartments().then((data) => setDepartments(data.departments || [])).catch(console.error);
    fetchCourses("");
  }, []);

  const fetchCourses = async (search) => {
    setPrereqLoading(true);
    try {
      const data = await getAllCourses(1, 50, search);
      setCourses(data.courses || []);
    } catch (e) {
      console.error(e);
    } finally {
      setPrereqLoading(false);
    }
  };

  const handlePrereqSearch = (e) => {
    const val = e.target.value;
    setPrereqSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchCourses(val), 350);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const togglePrereq = (id, add) => {
    setFormData((prev) => ({
      ...prev,
      prerequisites_array: add
        ? [...prev.prerequisites_array, id]
        : prev.prerequisites_array.filter((x) => x !== id),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await createCourse({ ...formData, credits: parseInt(formData.credits), level: parseInt(formData.level) });
      setMessage("Course created successfully!");
      setFormData({ department_id: "", code: "", title: "", credits: "", level: "", required_room_type: "", prerequisites_array: [], is_activated: true });
      setPrereqSearch("");
      fetchCourses("");
    } catch (error) {
      setMessage(error.message || "Failed to create course.");
    } finally {
      setLoading(false);
    }
  };

  const selected = courses.filter((c) => formData.prerequisites_array.includes(c._id));
  const unselected = courses.filter((c) => !formData.prerequisites_array.includes(c._id));

  return (
    <div className="create-course-container dark-bg">
      <div className="create-course-header">
        <h1>Create New Course</h1>
        <p className="subtitle">Enter the details below to register a new course in the academic catalog.</p>
      </div>

      <form onSubmit={handleSubmit} className="create-course-form dark-card">
        <div className="section-title"><FiInfo className="section-icon" /><span>Basic Information</span></div>

        <div className="form-row">
          <div className="form-group">
            <label>Course Name</label>
            <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Data Structures" required />
          </div>
          <div className="form-group">
            <label>Course Code</label>
            <input type="text" name="code" value={formData.code} onChange={handleInputChange} placeholder="e.g. CS102" required />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Department (optional)</label>
            <select name="department_id" value={formData.department_id} onChange={handleInputChange}>
              <option value="">Select Department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name} ({d.code})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Credit Hours</label>
            <input type="number" name="credits" value={formData.credits} onChange={handleInputChange} min="1" max="6" placeholder="3" required />
          </div>
          <div className="form-group">
            <label>Course Level</label>
            <select name="level" value={formData.level} onChange={handleInputChange} required>
              <option value="">Level</option>
              {[1,2,3,4].map((l) => <option key={l} value={l}>Level {l}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Required Room Type</label>
          <select name="required_room_type" value={formData.required_room_type} onChange={handleInputChange} required>
            <option value="">Select Room Type</option>
            <option value="Lab">Lab</option>
            <option value="Lecture Hall">Lecture Hall</option>
            <option value="Tutorial">Tutorial</option>
          </select>
        </div>

        <div className="section-title" style={{ marginTop: 32 }}>
          <FiBookOpen className="section-icon" /><span>Curriculum & Requirements</span>
        </div>

        <div className="form-group">
          <label>Prerequisites</label>
          <div className="prerequisites-select">
            {/* Search — hits backend with 350ms debounce */}
            <div className="prereq-search-wrapper">
              <FiSearch className="prereq-search-icon" />
              <input
                type="text"
                className="prereq-search"
                placeholder="Search by code or title..."
                value={prereqSearch}
                onChange={handlePrereqSearch}
              />
            </div>

            {/* Selected tags */}
            {selected.length > 0 && (
              <div className="prereq-tags" style={{ marginBottom: "0.5rem" }}>
                {selected.map((c) => (
                  <span key={c._id} className="prereq-tag">
                    {c.code} — {c.title}
                    <span className="remove-tag" onClick={() => togglePrereq(c._id, false)}>×</span>
                  </span>
                ))}
              </div>
            )}

            {/* Results */}
            {prereqLoading ? (
              <p style={{ color: "#64748b", fontSize: "0.8rem", padding: "0.5rem" }}>Searching...</p>
            ) : (
              <div className="prereq-tags">
                {unselected.map((c) => (
                  <span key={c._id} className="prereq-tag inactive" onClick={() => togglePrereq(c._id, true)}>
                    {c.code}
                  </span>
                ))}
                {unselected.length === 0 && prereqSearch && (
                  <p style={{ color: "#64748b", fontSize: "0.8rem" }}>No courses found for "{prereqSearch}"</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="form-group core-requirement-toggle">
          <span className="core-icon"><FiStar /></span>
          <span>Core Requirement</span>
          <label className="switch">
            <input type="checkbox" name="is_activated" checked={formData.is_activated} onChange={handleInputChange} />
            <span className="slider round"></span>
          </label>
          <span className="core-desc">Mark this course as mandatory for graduation</span>
        </div>

        {message && (
          <div className={`message ${message.includes("successfully") ? "success" : "error"}`}>{message}</div>
        )}

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? "Creating..." : "Create Course"}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;
