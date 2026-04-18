import { useEffect, useState } from "react";
import { getMyGrades } from "../../../../services/gradesService";
import "./MyGrades.css";

function gradeLabel(pct) {
  if (pct >= 90) return { letter: "A+", cls: "grade-a" };
  if (pct >= 85) return { letter: "A",  cls: "grade-a" };
  if (pct >= 80) return { letter: "B+", cls: "grade-b" };
  if (pct >= 75) return { letter: "B",  cls: "grade-b" };
  if (pct >= 70) return { letter: "C+", cls: "grade-c" };
  if (pct >= 65) return { letter: "C",  cls: "grade-c" };
  if (pct >= 60) return { letter: "D",  cls: "grade-d" };
  return { letter: "F", cls: "grade-f" };
}

// Build grade fields from config
function buildFields(config) {
  if (!config) return [];
  const fields = [];
  if (config.attendance_max > 0)
    fields.push({ key: "attendance", label: "Attendance", max: config.attendance_max });
  (config.quizzes || []).forEach((q, i) =>
    fields.push({ key: `quiz_${i}`, label: q.label || `Quiz ${i + 1}`, max: q.max })
  );
  if (config.midterm_max > 0)
    fields.push({ key: "midterm", label: "Midterm", max: config.midterm_max });
  fields.push({ key: "year_work", label: "Year Work Total", max: config.year_work_max || 40, isSummary: true });
  return fields;
}

export default function MyGrades() {
  const [data, setData] = useState([]);
  const [semester, setSemester] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyGrades()
      .then((res) => { setData(res.grades || []); setSemester(res.semester); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="mg-loading">Loading grades...</div>;

  return (
    <div className="mg-page">
      <div className="mg-header">
        <div>
          <h1>My Grades</h1>
          <p>{semester ? `${semester.term} ${semester.year}` : "Current Semester"}</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="mg-empty">No enrolled courses found for this semester.</div>
      ) : (
        <div className="mg-cards">
          {data.map((item) => {
            const cfg = item.config;
            const ywMax = cfg?.year_work_max || 40;

            const yw = parseFloat(item.grades?.year_work ?? 0);
            const total = yw;

            const pct = ywMax > 0 ? (total / ywMax) * 100 : 0;
            const { letter, cls } = gradeLabel(pct);
            const fields = buildFields(cfg);
            const hasAnyGrade = Object.keys(item.grades || {}).length > 0;

            return (
              <div key={item.enrollmentId} className="mg-card">
                <div className="mg-card-header">
                  <div>
                    <span className="mg-course-code">{item.course?.code}</span>
                    <h2 className="mg-course-title">{item.course?.title}</h2>
                    <span className="mg-credits">{item.course?.credits} Credit Hours</span>
                  </div>
                  <div className={`mg-grade-badge ${hasAnyGrade ? cls : ""}`}>
                    <span className="mg-grade-letter">{hasAnyGrade ? letter : "—"}</span>
                    <span className="mg-grade-pct">{hasAnyGrade ? `${pct.toFixed(0)}%` : "Pending"}</span>
                  </div>
                </div>

                <div className="mg-breakdown">
                  {fields.length === 0 ? (
                    // No config — show raw grades_object keys
                    Object.entries(item.grades || {}).map(([k, v]) => (
                      <div key={k} className="mg-field">
                        <div className="mg-field-top">
                          <span className="mg-field-label">{k}</span>
                          <span className="mg-field-score"><strong>{v}</strong></span>
                        </div>
                      </div>
                    ))
                  ) : (
                    fields.map((f) => {
                      const val = item.grades?.[f.key];
                      const hasVal = val !== undefined && val !== "" && val !== null;
                      const num = parseFloat(val);
                      const fieldPct = hasVal && !isNaN(num) ? (num / f.max) * 100 : null;
                      return (
                        <div key={f.key} className={`mg-field ${f.isSummary ? "mg-field-summary" : ""}`}>
                          <div className="mg-field-top">
                            <span className="mg-field-label">{f.label}</span>
                            <span className="mg-field-score">
                              {hasVal && !isNaN(num)
                                ? <><strong>{num}</strong> / {f.max}</>
                                : <span className="mg-pending">—</span>}
                            </span>
                          </div>
                          {!f.isSummary && (
                            <div className="mg-bar-bg">
                              <div className="mg-bar-fill"
                                style={{ width: fieldPct !== null ? `${Math.min(fieldPct, 100)}%` : "0%" }} />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="mg-total">
                  <span>Total</span>
                  <span>
                    {hasAnyGrade
                      ? <><strong>{total.toFixed(1)}</strong> / {ywMax}</>
                      : "—"}
                  </span>
                </div>

                {item.isGradeLocked && <div className="mg-locked">🔒 Grades finalized</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
