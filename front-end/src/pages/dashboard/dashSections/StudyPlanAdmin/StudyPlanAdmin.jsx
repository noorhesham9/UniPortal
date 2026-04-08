import { useEffect, useState } from "react";
import { FiCopy, FiFilter, FiInfo, FiPlus, FiTrash2 } from "react-icons/fi";
import { getDepartments, getAllCourses } from "../../../../services/CourseServices";
import {
  getStudyPlanCourses,
  addCourseToStudyPlan,
  removeCourseFromStudyPlan,
} from "../../../../services/StudyPlanServices";
import "./StudyPlanAdmin.css";

const StudyPlanAdmin = () => {
  const [departments, setDepartments] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [academicYear, setAcademicYear] = useState(1);
  const [semesterNum, setSemesterNum] = useState(1);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ course_id: "", course_type: "إجباري" });
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
    fetchAllCourses();
  }, []);

  useEffect(() => {
    if (selectedDept) fetchCourses();
  }, [selectedDept, academicYear, semesterNum]);

  const fetchDepartments = async () => {
    try {
      const res = await getDepartments();
      // getDepartments returns a plain array
      const list = Array.isArray(res) ? res : res.departments || [];
      setDepartments(list);
      if (list.length > 0) setSelectedDept(list[0]._id);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const res = await getAllCourses();
      setAllCourses(res.courses || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await getStudyPlanCourses({
        department_id: selectedDept,
        academic_year: academicYear,
        semester_num: semesterNum,
      });
      if (res.success) setCourses(res.courses);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm("Remove this course from the study plan?")) return;
    try {
      await removeCourseFromStudyPlan(entryId);
      setCourses((prev) => prev.filter((c) => c.planEntryId !== entryId));
    } catch (error) {
      console.error(error);
      alert("Failed to remove course.");
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!addForm.course_id) return;
    setAddLoading(true);
    try {
      await addCourseToStudyPlan({
        department_id: selectedDept,
        course_id: addForm.course_id,
        academic_year: academicYear,
        semester_num: semesterNum,
        course_type: addForm.course_type,
      });
      setShowAddModal(false);
      setAddForm({ course_id: "", course_type: "إجباري" });
      fetchCourses();
    } catch (error) {
      console.error(error);
      alert(error?.message || "Failed to add course.");
    } finally {
      setAddLoading(false);
    }
  };

  const totalCredits = courses.reduce((acc, curr) => acc + curr.credits, 0);

  return (
    <div className="study-plan-admin-container">
      <header className="spa-header">
        <div className="spa-header-right">
          <h1 className="spa-title">تعديل الخطة الدراسية</h1>
          <p className="spa-subtitle">
            تحديث المساقات والمتطلبات للأعوام الأكاديمية
          </p>
        </div>
        <div className="spa-header-left">
          <select
            className="spa-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            <option value="">اختر القسم</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      <div className="spa-controls-card">
        <div className="spa-filters">
          <div className="spa-filter-group">
            <span className="spa-filter-label">السنة الدراسية</span>
            <div className="spa-filter-buttons">
              <button
                className={`spa-filter-btn ${academicYear === 1 ? "active" : ""}`}
                onClick={() => setAcademicYear(1)}
              >
                الأولى
              </button>
              <button
                className={`spa-filter-btn ${academicYear === 2 ? "active" : ""}`}
                onClick={() => setAcademicYear(2)}
              >
                الثانية
              </button>
              <button
                className={`spa-filter-btn ${academicYear === 3 ? "active" : ""}`}
                onClick={() => setAcademicYear(3)}
              >
                الثالثة
              </button>
              <button
                className={`spa-filter-btn ${academicYear === 4 ? "active" : ""}`}
                onClick={() => setAcademicYear(4)}
              >
                الرابعة
              </button>
            </div>
          </div>
          <div className="spa-filter-group">
            <span className="spa-filter-label">الفصل الدراسي</span>
            <div className="spa-filter-buttons">
              <button
                className={`spa-filter-btn ${semesterNum === 1 ? "active" : ""}`}
                onClick={() => setSemesterNum(1)}
              >
                الفصل الأول
              </button>
              <button
                className={`spa-filter-btn ${semesterNum === 2 ? "active" : ""}`}
                onClick={() => setSemesterNum(2)}
              >
                الفصل الثاني
              </button>
              <button
                className={`spa-filter-btn ${semesterNum === 3 ? "active" : ""}`}
                onClick={() => setSemesterNum(3)}
              >
                الصيفي
              </button>
            </div>
          </div>
        </div>
        <div className="spa-actions">
          <button className="spa-action-btn">
            <FiFilter /> تصفية متقدمة
          </button>
          <button className="spa-action-btn">
            <FiCopy /> نسخ خطة من قسم آخر
          </button>
          <button className="spa-action-btn primary">
            <FiPlus /> إضافة مقرر للجامعة
          </button>
        </div>
      </div>

      <div className="spa-table-card">
        <table className="spa-table">
          <thead>
            <tr>
              <th>رمز المقرر</th>
              <th>اسم المقرر</th>
              <th>الساعات</th>
              <th>المتطلبات السابقة</th>
              <th>النوع</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="spa-loading">
                  جاري التحميل...
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan="6" className="spa-loading">
                  لا يوجد مقررات في هذا الفصل.
                </td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course._id}>
                  <td className="spa-code-cell">{course.code}</td>
                  <td>{course.title}</td>
                  <td>{course.credits}</td>
                  <td>
                    {course.prerequisites_array?.length > 0 ? (
                      course.prerequisites_array.map((req) => (
                        <span key={req._id} className="spa-tag spa-req-tag">
                          {req.code} ×
                        </span>
                      ))
                    ) : (
                      <span className="spa-tag spa-req-tag">لا يوجد ×</span>
                    )}
                    <button className="spa-add-req-btn">+ إضافة</button>
                  </td>
                  <td>
                    <span className="spa-tag spa-type-tag">
                      {course.course_type || "إجباري"}
                    </span>
                  </td>
                  <td>
                    <button className="spa-del-btn" onClick={() => handleDelete(course.planEntryId)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <button className="spa-add-new-btn" onClick={() => setShowAddModal(true)}>
          <FiPlus /> إضافة مساق جديد لهذا الفصل
        </button>

        <div className="spa-table-footer">
          <div className="spa-tf-item">
            <span className="spa-tf-label">إجمالي الساعات</span>
            <span className="spa-tf-value">{totalCredits}</span>
          </div>
          <div className="spa-tf-item">
            <span className="spa-tf-label">إجباري</span>
            <span className="spa-tf-value-accent">
              {courses
                .filter((c) => c.course_type !== "اختياري")
                .reduce((acc, curr) => acc + curr.credits, 0)}
            </span>
          </div>
          <div className="spa-tf-item">
            <span className="spa-tf-label">اختياري</span>
            <span className="spa-tf-value">
              {courses
                .filter((c) => c.course_type === "اختياري")
                .reduce((acc, curr) => acc + curr.credits, 0)}
            </span>
          </div>
        </div>
      </div>

      <div className="spa-bottom-cards">
        <div className="spa-state-card">
          <div className="spa-state-title">الحالة الحالية للخطة</div>
          <div className="spa-state-status">
            معتمدة ومفعلة <span className="spa-dot"></span>
          </div>
          <button className="spa-state-link">عرض نسخة PDF</button>
        </div>

        <div className="spa-info-card">
          <div className="spa-info-icon">
            <FiInfo />
          </div>
          <div className="spa-info-content">
            <h4>تعليمات تحديث الخطة</h4>
            <p>
              يرجى التأكد من أن مجموع الساعات المعتمدة لكل فصل دراسي يتراوح بين
              12 و 18 ساعة حسب اللوائح الأكاديمية. عند تغيير المتطلبات السابقة،
              سيتم تنبيه الطلاب المتأثرين آلياً.
            </p>
          </div>
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="spa-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="spa-modal" onClick={(e) => e.stopPropagation()}>
            <div className="spa-modal-header">
              <h3>إضافة مساق للخطة الدراسية</h3>
              <button className="spa-modal-close" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAdd}>
              <div className="spa-modal-body">
                <div className="spa-modal-field">
                  <label>المقرر</label>
                  <div className="spa-modal-select-wrapper">
                    <select
                      value={addForm.course_id}
                      onChange={(e) => setAddForm((f) => ({ ...f, course_id: e.target.value }))}
                      required
                    >
                      <option value="">اختر مقرراً</option>
                      {allCourses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.code} — {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="spa-modal-field">
                  <label>صفة المقرر</label>
                  <div className="spa-modal-select-wrapper">
                    <select
                      value={addForm.course_type}
                      onChange={(e) => setAddForm((f) => ({ ...f, course_type: e.target.value }))}
                    >
                      <option value="إجباري">إجباري</option>
                      <option value="اختياري">اختياري</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="spa-modal-actions">
                <button type="button" className="spa-modal-cancel" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="spa-modal-submit" disabled={addLoading}>
                  {addLoading ? "جاري الإضافة..." : "إضافة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlanAdmin;
