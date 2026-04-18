import { useEffect, useMemo, useState } from "react";
import {
  dropEnrollment,
  enrollInSection,
  getAvailableCourses,
  getMyEligibility,
  getMyEnrollments,
} from "../../../../services/CourseServices";
import "./ViewCourses.css";

const RegisterCourses = () => {
  const [availableCoursesRes, setAvailableCoursesRes] = useState(null);
  const [enrollmentsRes, setEnrollmentsRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [siteLocked, setSiteLocked] = useState(false);
  const [eligibility, setEligibility] = useState(null); // { eligible, slice, student, reasons }
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [enrollingSectionId, setEnrollingSectionId] = useState(null);
  const [droppingEnrollmentId, setDroppingEnrollmentId] = useState(null);

  const courses = availableCoursesRes?.courses || [];
  const sections = availableCoursesRes?.sections || [];
  const enrollments = enrollmentsRes?.enrollments || [];

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check eligibility first — tells us if the student qualifies for the active slice
      const eligData = await getMyEligibility();
      setEligibility(eligData);

      // If there's an active slice and student is not eligible, stop here
      if (eligData.slice && !eligData.eligible) {
        setLoading(false);
        return;
      }

      const coursesData = await getAvailableCourses();
      setAvailableCoursesRes(coursesData);

      if (!coursesData.success) {
        setError(coursesData.message || "Failed to load courses");
        setLoading(false);
        return;
      }

      const activeSemesterId = coursesData.activeSemesterId ?? null;
      const enrollmentsData = await getMyEnrollments(activeSemesterId);
      setEnrollmentsRes(enrollmentsData);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.locked) {
        setSiteLocked(true);
      } else {
        setError(
          typeof err === "string" ? err : err?.message || "Failed to load data",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const availableCourseIds = useMemo(
    () => new Set((courses || []).map((c) => c._id?.toString())),
    [courses],
  );

  const sectionsForAvailable = useMemo(() => {
    return (sections || []).filter((sec) => {
      const cid = sec.course_id?._id?.toString();
      return cid && availableCourseIds.has(cid);
    });
  }, [sections, availableCourseIds]);

  const courseGroups = useMemo(() => {
    const byCourse = new Map();
    for (const sec of sectionsForAvailable) {
      console.log(sectionsForAvailable);
      const cid = sec.course_id?._id?.toString();
      if (!cid) continue;
      if (!byCourse.has(cid)) {
        byCourse.set(cid, { course: sec.course_id, sections: [] });
      }
      byCourse.get(cid).sections.push(sec);
    }
    return Array.from(byCourse.entries()).map(
      ([courseId, { course, sections: secs }]) => ({
        courseId,
        course,
        sections: secs,
      }),
    );
  }, [sectionsForAvailable]);

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return courseGroups;
    console.log(courseGroups);
    const q = searchQuery.trim().toLowerCase();
    return courseGroups.filter((g) => {
      const code = (g.course?.code || "").toLowerCase();
      const title = (g.course?.title || "").toLowerCase();
      return code.includes(q) || title.includes(q);
    });
  }, [courseGroups, searchQuery]);

  const enrolledSectionIds = useMemo(
    () =>
      new Set(
        enrollments.map((e) => e.section?._id?.toString()).filter(Boolean),
      ),
    [enrollments],
  );

  const enrollmentBySectionId = useMemo(() => {
    const map = new Map();
    for (const e of enrollments) {
      const sid = e.section?._id?.toString();
      if (sid) map.set(sid, e);
    }
    return map;
  }, [enrollments]);

  const toggleCollapsed = (courseId) => {
    setCollapsed((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const handleEnroll = async (sectionId) => {
    setEnrollingSectionId(sectionId);
    try {
      await enrollInSection(sectionId);
      const coursesData = await getAvailableCourses();
      setAvailableCoursesRes(coursesData);
      const activeSemesterId = coursesData.activeSemesterId ?? null;
      const enrollData = await getMyEnrollments(activeSemesterId);
      setEnrollmentsRes(enrollData);
    } catch (err) {
      const data = err?.response?.data;
      if (data?.reasons?.length) {
        alert("Enrollment not allowed:\n\n" + data.reasons.map((r, i) => `${i + 1}. ${r}`).join("\n"));
      } else {
        alert(data?.message || err?.message || "Enrollment failed");
      }
    } finally {
      setEnrollingSectionId(null);
    }
  };

  const handleDrop = async (enrollmentId) => {
    setDroppingEnrollmentId(enrollmentId);
    try {
      await dropEnrollment(enrollmentId);
      const coursesData = await getAvailableCourses();
      setAvailableCoursesRes(coursesData);
      const activeSemesterId = coursesData.activeSemesterId ?? null;
      const enrollData = await getMyEnrollments(activeSemesterId);
      setEnrollmentsRes(enrollData);
    } catch (err) {
      const msg = err?.message || err?.response?.data?.message || "Drop failed";
      alert(msg);
    } finally {
      setDroppingEnrollmentId(null);
    }
  };

  const totalCredits = useMemo(() => {
    return enrollments.reduce((sum, e) => {
      const cred = e.section?.course_id?.credits;
      return sum + (typeof cred === "number" ? cred : 0);
    }, 0);
  }, [enrollments]);

  const MAX_CREDITS = 18;

  if (loading) {
    return (
      <div className="vc-container">
        <div className="vc-main">
          <p className="vc-loading">Loading courses and sections…</p>
        </div>
      </div>
    );
  }

  if (siteLocked) {
    return (
      <div className="vc-container">
        <div className="vc-main">
          <div className="vc-locked-box">
            <div className="vc-locked-icon">🔒</div>
            <h3 className="vc-locked-title">
              Registration is Currently Closed
            </h3>
            <p className="vc-locked-msg">
              The system is temporarily locked by the administration. Please
              check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Registration fully closed — no active slice
  if (eligibility && eligibility.registrationClosed) {
    return (
      <div className="vc-container">
        <div className="vc-main">
          <div className="vc-locked-box">
            <div className="vc-locked-icon">🔒</div>
            <h3 className="vc-locked-title">Registration is Currently Closed</h3>
            <p className="vc-locked-msg">
              There is no active registration window at this time. Please check back later or contact the administration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Active slice exists but student doesn't qualify
  if (eligibility && eligibility.slice && !eligibility.eligible) {
    const { slice, student, reasons } = eligibility;
    return (
      <div className="vc-container">
        <div className="vc-main">
          <div className="vc-locked-box">
            <div className="vc-locked-icon">🚫</div>
            <h3 className="vc-locked-title">
              You Are Not Eligible for This Registration Window
            </h3>
            <p className="vc-locked-msg">
              The active slice <strong>{slice.name}</strong> does not include
              you based on your current academic data.
            </p>

            <div
              className="vc-slice-info"
              style={{ textAlign: "left", width: "100%" }}
            >
              <p className="vc-slice-label">Why you're not eligible:</p>
              <ul
                style={{
                  margin: "0.5rem 0 0 1rem",
                  padding: 0,
                  listStyle: "disc",
                }}
              >
                {reasons.map((r, i) => (
                  <li
                    key={i}
                    style={{ marginBottom: "0.3rem", color: "#e53e3e" }}
                  >
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="vc-slice-info" style={{ marginTop: "1rem" }}>
              <p className="vc-slice-label">Your Academic Data</p>
              <p className="vc-slice-detail">
                GPA: <strong>{student.gpa?.toFixed(2) ?? "—"}</strong>
              </p>
              <p className="vc-slice-detail">
                Department: <strong>{student.department ?? "—"}</strong>
              </p>
              <p className="vc-slice-detail">
                Level: <strong>{student.level ?? "—"}</strong>
              </p>
            </div>

            <div className="vc-slice-info" style={{ marginTop: "1rem" }}>
              <p className="vc-slice-label">Slice Requirements</p>
              <p className="vc-slice-detail">
                GPA Range:{" "}
                <strong>
                  {slice.min_gpa} – {slice.max_gpa}
                </strong>
              </p>
              {slice.departments?.length > 0 && (
                <p className="vc-slice-detail">
                  Departments:{" "}
                  <strong>
                    {slice.departments.map((d) => d.name).join(", ")}
                  </strong>
                </p>
              )}
              {slice.levels?.length > 0 && (
                <p className="vc-slice-detail">
                  Levels: <strong>{slice.levels.join(", ")}</strong>
                </p>
              )}
              <p className="vc-slice-detail">
                Window:{" "}
                <strong>
                  {new Date(slice.start_date).toLocaleDateString()} —{" "}
                  {new Date(slice.end_date).toLocaleDateString()}
                </strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="vc-container">
        <div className="vc-main">
          <div className="vc-locked-box">
            <div className="vc-locked-icon">⚠️</div>
            <p className="vc-locked-msg">{error}</p>
            <button
              type="button"
              className="vc-confirm-btn"
              style={{ maxWidth: 200, marginTop: "1rem" }}
              onClick={fetchData}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="vc-container">
      <div className="vc-main">
        <div className="vc-courses-container">
          <div className="vc-courses-header">
            <div>
              {/* <h2 className="vc-courses-title">
                {semester ? `${semester.term || ""} ${semester.year || ""} – Register` : "Course registration"}
              </h2> */}
              <p className="vc-courses-subtitle">
                Select a section per course to enroll. Minimum 12 credits
                recommended. Max {MAX_CREDITS} credits.
              </p>
            </div>
            <div className="vc-courses-Search">
              <input
                type="text"
                placeholder="Search by code or title"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredGroups.length === 0 ? (
            <p className="vc-empty-sel">
              {courseGroups.length === 0
                ? "No courses with sections available for this semester."
                : "No courses match your search."}
            </p>
          ) : (
            filteredGroups.map(({ courseId, course, sections: secs }) => {
              const isCollapsed = collapsed[courseId] === true;
              return (
                <div key={courseId} className="vc-course-group">
                  <div
                    className={`vc-course-group-header ${isCollapsed ? "collapsed" : ""}`}
                    onClick={() => toggleCollapsed(courseId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleCollapsed(courseId);
                      }
                    }}
                  >
                    <div className="vc-course-group-header-left">
                      <span className="vc-course-group-chevron">▼</span>
                      <div className="vc-course-group-badge">
                        <span>CR</span>
                        {/* <span>{course?.credits ?? "–"}</span> */}
                      </div>
                      <div className="vc-course-group-title-wrap">
                        <h3 className="vc-course-group-code">
                          {course?.code ?? "–"}
                        </h3>
                        <p className="vc-course-group-title">
                          {course?.title ?? ""}
                        </p>
                      </div>
                    </div>
                  </div>
                  {!isCollapsed && (
                    <div className="vc-course-group-sections">
                      {secs.map((sec) => {
                        const secId = sec._id?.toString();
                        const isEnrolled = enrolledSectionIds.has(secId);
                        const enrollment = enrollmentBySectionId.get(secId);
                        const instructorName = sec.instructor_id?.name ?? "–";
                        const roomLabel =
                          sec.room_id?.room_name ?? sec.room_id?.number ?? "–";
                        const timeStr = [sec.day, sec.start_time, sec.end_time]
                          .filter(Boolean)
                          .join(" ");
                        return (
                          <div key={sec._id} className="vc-section-row">
                            <div className="vc-section-info">
                              <span className="vc-section-num">
                                Sec {sec.sectionNumber}
                              </span>
                              <span className="vc-section-time">
                                {timeStr || "–"}
                              </span>
                              <span>{instructorName}</span>
                              <span>Room {roomLabel}</span>
                              <span>Cap. {sec.capacity}</span>
                            </div>
                            <div className="vc-section-actions">
                              {isEnrolled ? (
                                <>
                                  <span className="vc-section-enrolled-badge">
                                    {enrollment?.status === "Waitlist"
                                      ? "Waitlist"
                                      : "Enrolled"}
                                  </span>
                                  <button
                                    type="button"
                                    className="vc-section-drop-btn"
                                    disabled={
                                      droppingEnrollmentId === enrollment?._id
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (enrollment?._id)
                                        handleDrop(enrollment._id);
                                    }}
                                  >
                                    Drop
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  className="vc-section-enroll-btn"
                                  disabled={enrollingSectionId === secId}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEnroll(sec._id);
                                  }}
                                >
                                  {enrollingSectionId === secId
                                    ? "Enrolling…"
                                    : "Enroll"}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="vc-sidebar">
        <div className="vc-side-card">
          <h2 className="vc-side-title">My enrollments</h2>
          <div>
            {enrollments.length === 0 ? (
              <p className="vc-empty-sel">No sections enrolled yet.</p>
            ) : (
              enrollments.map((e) => (
                <div key={e._id} className="vc-sel-item">
                  <div>
                    <h4 className="vc-sel-title">
                      {e.section?.course_id?.code} – Sec{" "}
                      {e.section?.sectionNumber}
                    </h4>
                    <p className="vc-sel-meta">
                      {[
                        e.section?.day,
                        e.section?.start_time,
                        e.section?.end_time,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </div>
                  <div className="vc-sel-right">
                    <span className="vc-sel-cr">
                      {e.section?.course_id?.credits ?? 0} CR
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDrop(e._id)}
                      className="vc-sel-remove"
                      disabled={droppingEnrollmentId === e._id}
                    >
                      Drop
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="vc-summary">
            <div className="vc-summary-row">
              <span className="vc-summary-lbl">Total credits</span>
              <div>
                <span className="vc-summary-val">{totalCredits}</span>
                <span className="vc-summary-max"> / {MAX_CREDITS}</span>
              </div>
            </div>
            <div className="vc-progress-bg">
              <div
                className="vc-progress-fill"
                style={{
                  width: `${Math.min((totalCredits / MAX_CREDITS) * 100, 100)}%`,
                }}
              />
            </div>
            {totalCredits < 12 && totalCredits > 0 && (
              <div className="vc-alert-box">
                <span>ℹ️</span>
                <p className="vc-alert-txt">
                  You have {totalCredits} credits. Full-time minimum is often
                  12.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterCourses;
