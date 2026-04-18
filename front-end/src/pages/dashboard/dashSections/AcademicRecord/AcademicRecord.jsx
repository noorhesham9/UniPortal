import { useEffect, useState } from "react";
import { FiAward, FiBook, FiTrendingUp } from "react-icons/fi";
import api from "../../../../services/api";
import "./AcademicRecord.css";

export default function AcademicRecord() {
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current user's academic record
    api.get("/auth/me")
      .then((r) => api.get(`/grades/academic-record/${r.data.user._id}`))
      .then((r) => setRecord(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="ar-loading">Loading academic record...</div>;
  if (!record) return <div className="ar-empty">No academic record found.</div>;

  const { student, summary, semesterRecords } = record;

  return (
    <div className="ar-page">
      {/* Header */}
      <div className="ar-header">
        <div>
          <h1>Academic Record</h1>
          <p>{student.name} • {student.studentId}</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="ar-summary">
        <div className="ar-card ar-card-gpa">
          <FiAward size={28} />
          <div>
            <span className="ar-card-value">{summary.cumulativeGPA}</span>
            <span className="ar-card-label">Cumulative GPA</span>
          </div>
        </div>

        <div className="ar-card ar-card-credits">
          <FiBook size={28} />
          <div>
            <span className="ar-card-value">{summary.totalCreditsEarned} / {summary.requiredCredits}</span>
            <span className="ar-card-label">Credits Earned</span>
          </div>
        </div>

        <div className="ar-card ar-card-progress">
          <FiTrendingUp size={28} />
          <div>
            <span className="ar-card-value">{summary.completionPercentage}%</span>
            <span className="ar-card-label">Completion</span>
          </div>
        </div>

        <div className="ar-card ar-card-remaining">
          <FiBook size={28} />
          <div>
            <span className="ar-card-value">{summary.remainingCredits}</span>
            <span className="ar-card-label">Credits Remaining</span>
          </div>
        </div>
      </div>

      {/* Department Info */}
      <div className="ar-dept-info">
        <strong>Department:</strong> {student.department} ({student.departmentCode})
      </div>

      {/* Semester Records */}
      <div className="ar-semesters">
        {semesterRecords.map((sr, idx) => (
          <div key={idx} className="ar-semester-block">
            <div className="ar-semester-header">
              <div>
                <h2>{sr.semester.term} {sr.semester.year}</h2>
                <span className="ar-sem-credits">
                  {sr.creditsEarned} credits earned • {sr.creditsAttempted} attempted
                </span>
              </div>
              <div className="ar-sem-gpa">
                <span className="ar-gpa-label">Semester GPA</span>
                <span className="ar-gpa-value">{sr.semesterGPA}</span>
              </div>
            </div>

            <div className="ar-table-wrap">
              <table className="ar-table">
                <thead>
                  <tr>
                    <th>Course Code</th>
                    <th>Course Title</th>
                    <th>Credits</th>
                    <th>Grade</th>
                    <th>Points</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sr.courses.map((c, i) => (
                    <tr key={i} className={c.passed ? "ar-row-pass" : "ar-row-fail"}>
                      <td className="ar-code">{c.courseCode}</td>
                      <td className="ar-title">{c.courseTitle}</td>
                      <td className="ar-center">{c.credits}</td>
                      <td className="ar-center">
                        <span className={`ar-grade ar-grade-${c.grade.replace("+", "p")}`}>
                          {c.isLocked ? c.grade : "—"}
                        </span>
                      </td>
                      <td className="ar-center">{c.isLocked ? c.gradePoint.toFixed(1) : "—"}</td>
                      <td className="ar-center">
                        {!c.isLocked ? (
                          <span className="ar-status ar-pending">Pending</span>
                        ) : c.passed ? (
                          <span className="ar-status ar-pass">✓ Pass</span>
                        ) : (
                          <span className="ar-status ar-fail">✗ Fail</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
