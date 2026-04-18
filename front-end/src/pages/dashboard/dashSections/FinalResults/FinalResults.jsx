import { useEffect, useState } from "react";
import { getFinalResults } from "../../../../services/gradesService";
import "./FinalResults.css";

const gradeClass = (g) => {
  if (["A+", "A"].includes(g)) return "fr-a";
  if (["B+", "B"].includes(g)) return "fr-b";
  if (["C+", "C"].includes(g)) return "fr-c";
  if (g === "D") return "fr-d";
  return "fr-f";
};

export default function FinalResults() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSem, setOpenSem] = useState(null);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    getFinalResults()
      .then((d) => {
        setResults(d.results || []);
        setShowResults(d.showResults || false);
        if (d.results?.length) setOpenSem(d.results[0].semester._id);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="fr-loading">Loading results...</div>;

  if (!showResults)
    return (
      <div className="fr-empty">
        <span>🔒</span>
        <p>Final results are not available yet.</p>
        <small>Results will be visible once the administration releases them.</small>
      </div>
    );

  if (results.length === 0)
    return (
      <div className="fr-empty">
        <span>📋</span>
        <p>No final results available yet.</p>
        <small>Results appear after the semester ends and grades are finalized.</small>
      </div>
    );

  // Cumulative GPA across all semesters
  const allCourses = results.flatMap((r) => r.courses);
  const totalCredits = allCourses.reduce((s, c) => s + (c.course?.credits || 0), 0);
  const passedCredits = allCourses
    .filter((c) => c.passed)
    .reduce((s, c) => s + (c.course?.credits || 0), 0);

  return (
    <div className="fr-page">
      <div className="fr-header">
        <div>
          <h1>Final Results</h1>
          <p>End-of-semester academic results</p>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="fr-summary">
        <div className="fr-stat">
          <span>{results.length}</span>
          <small>Semesters</small>
        </div>
        <div className="fr-stat">
          <span>{totalCredits}</span>
          <small>Total Credit Hours</small>
        </div>
        <div className="fr-stat">
          <span>{passedCredits}</span>
          <small>Passed Hours</small>
        </div>
        <div className="fr-stat fr-stat-gpa">
          <span>{results[0]?.gpa ?? "—"}</span>
          <small>Latest GPA</small>
        </div>
      </div>

      {/* ── Semester Tabs ── */}
      <div className="fr-tabs">
        {results.map((r) => (
          <button
            key={r.semester._id}
            className={`fr-tab ${openSem === r.semester._id ? "active" : ""}`}
            onClick={() => setOpenSem(r.semester._id)}
          >
            {r.semester.term} {r.semester.year}
          </button>
        ))}
      </div>

      {/* ── Active Semester Results ── */}
      {results
        .filter((r) => r.semester._id === openSem)
        .map((r) => (
          <div key={r.semester._id} className="fr-sem-block">
            <div className="fr-sem-meta">
              <span>GPA this semester: <strong>{r.gpa}</strong></span>
              <span>{r.courses.length} courses</span>
            </div>

            <div className="fr-table-wrap">
              <table className="fr-table">
                <thead>
                  <tr>
                    <th>Course</th>
                    <th>Credits</th>
                    <th>Total</th>
                    <th>Grade</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {r.courses.map((c) => (
                    <tr key={c.enrollmentId}>
                      <td>
                        <div className="fr-course-name">{c.course?.title}</div>
                        <div className="fr-course-code">{c.course?.code}</div>
                      </td>
                      <td>{c.course?.credits}</td>
                      <td>
                        <div className="fr-total-bar">
                          <span>{c.total.toFixed(1)} / {c.totalMax ?? 100}</span>
                          <div className="fr-bar-bg">
                            <div
                              className={`fr-bar-fill ${c.passed ? "fr-bar-pass" : "fr-bar-fail"}`}
                              style={{ width: `${Math.min((c.total / (c.totalMax || 100)) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`fr-grade ${gradeClass(c.grade)}`}>{c.grade}</span>
                      </td>
                      <td>
                        <span className={`fr-status ${c.passed ? "fr-pass" : "fr-fail"}`}>
                          {c.passed ? "✓ Pass" : "✗ Fail"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
    </div>
  );
}
