import { useEffect, useState } from "react";
import { FiDownload, FiPrinter } from "react-icons/fi";
import { getActiveDepartments, getStudyPlanCourses } from "../../../../services/StudyPlanServices";
import "./StudyPlanStudent.css";

const StudyPlanStudent = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [level, setLevel] = useState(2); // Default to current level
  const [showFullPlan, setShowFullPlan] = useState(false);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDept) {
      fetchCourses();
    }
  }, [selectedDept, level, showFullPlan]);

  const fetchDepartments = async () => {
    try {
      const res = await getActiveDepartments();
      const list = res.departments || [];
      setDepartments(list);
      if (list.length > 0) setSelectedDept(list[0]._id);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = { department_id: selectedDept };
      if (!showFullPlan) {
        params.academic_year = level;
      }
      const res = await getStudyPlanCourses(params);
      if (res.success) {
        setCourses(res.courses);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Group courses by semester
  const semestersGrouped = courses.reduce((acc, course) => {
    // If we map year + semester_num to absolute semester (1 to 8)
    const absoluteSemester =
      (course.academic_year - 1) * 2 + course.semester_num;
    if (!acc[absoluteSemester]) acc[absoluteSemester] = [];
    acc[absoluteSemester].push(course);
    return acc;
  }, {});

  const renderSemesterCard = (semIndex, semCourses) => {
    const totalCredits = semCourses.reduce((sum, c) => sum + c.credits, 0);
    const requiredCredits = semCourses
      .filter((c) => c.course_type !== "اختياري")
      .reduce((sum, c) => sum + c.credits, 0);
    const electiveCredits = totalCredits - requiredCredits;

    // Names in Arabic
    const semesterNames = [
      "",
      "الفصل الدراسي الأول",
      "الفصل الدراسي الثاني",
      "الفصل الدراسي الثالث",
      "الفصل الدراسي الرابع",
      "الفصل الدراسي الخامس",
      "الفصل الدراسي السادس",
      "الفصل الدراسي السابع",
      "الفصل الدراسي الثامن",
    ];

    return (
      <div className="sps-sem-card" key={semIndex}>
        <div className="sps-sem-header">
          <div className="sps-sem-stats">
            <span className="sps-stat sps-stat-required">
              {requiredCredits} س إجبارية
            </span>
            <span className="sps-stat sps-stat-elective">
              {electiveCredits} س اختيارية
            </span>
          </div>
          <div className="sps-sem-title">
            <h3>{semesterNames[semIndex] || `الفصل ${semIndex}`}</h3>
            <span className="sps-sem-badge">{semIndex}</span>
          </div>
        </div>
        <table className="sps-table">
          <thead>
            <tr>
              <th>رمز المقرر</th>
              <th>اسم المقرر</th>
              <th>المتطلبات</th>
              <th>عدد الساعات</th>
              <th>صفة المقرر</th>
            </tr>
          </thead>
          <tbody>
            {semCourses.map((course) => (
              <tr key={course._id}>
                <td className="sps-code">{course.code}</td>
                <td className="sps-title-cell">{course.title}</td>
                <td>
                  {course.prerequisites_array?.length > 0 ? (
                    course.prerequisites_array.map((req) => (
                      <span key={req._id} className="sps-req-badge">
                        {req.code}
                      </span>
                    ))
                  ) : (
                    <span className="sps-req-badge sps-req-none">-</span>
                  )}
                </td>
                <td>{course.credits}</td>
                <td>
                  <span
                    className={`sps-type-badge ${course.course_type === "اختياري" ? "elective" : "required"}`}
                  >
                    {course.course_type || "إجباري"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="study-plan-student-container">
      <header className="sps-main-header">
        <h1 className="sps-headline">
          <span className="sps-icon">🎓</span> تخصيص الخطة الدراسية
        </h1>
        <p className="sps-subtitle">القسم الأكاديمي</p>
      </header>

      <div className="sps-controls">
        <div className="sps-controls-right">
          <div className="sps-control-group">
            <label>القسم الأكاديمي</label>
            <select
              className="sps-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sps-control-group">
            <label>المستوى / السنة</label>
            <select
              className="sps-select"
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              disabled={showFullPlan}
            >
              <option value={1}>المستوى الأول (الفصل 1-2)</option>
              <option value={2}>المستوى الثاني (الفصل 3-4)</option>
              <option value={3}>المستوى الثالث (الفصل 5-6)</option>
              <option value={4}>المستوى الرابع (الفصل 7-8)</option>
            </select>
          </div>
        </div>

        <div className="sps-controls-left">
          <div className="sps-toggle-group">
            <label>عرض الخطة الكاملة (8 فصول)</label>
            <label className="sps-switch">
              <input
                type="checkbox"
                checked={showFullPlan}
                onChange={(e) => setShowFullPlan(e.target.checked)}
              />
              <span className="sps-slider round"></span>
            </label>
          </div>
          <div className="sps-actions">
            <button className="sps-btn sps-btn-print">
              <FiPrinter /> طباعة
            </button>
            <button className="sps-btn sps-btn-pdf">
              <FiDownload /> PDF
            </button>
          </div>
        </div>
      </div>

      <div className="sps-divider">
        <h3>الفصول الدراسية المقترحة</h3>
        <span className="sps-subtext">بناءً على مستواك الحالي</span>
      </div>

      <div className="sps-grid">
        {loading ? (
          <div className="sps-loading">جاري تحميل الخطة الدراسية...</div>
        ) : Object.keys(semestersGrouped).length === 0 ? (
          <div className="sps-loading">
            لا يوجد بيانات للخطة الدراسية المحددة.
          </div>
        ) : (
          Object.keys(semestersGrouped)
            .sort((a, b) => a - b)
            .map((semIndex) =>
              renderSemesterCard(semIndex, semestersGrouped[semIndex]),
            )
        )}
      </div>
    </div>
  );
};

export default StudyPlanStudent;
