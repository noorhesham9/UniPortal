import React, { useState, useEffect, useMemo } from "react";
import {
  getAvailableCourses,
  getMyEnrollments,
  enrollInSection,
  dropEnrollment,
} from "../../../../services/CourseServices";
import "./ViewCourses.css";

const ViewCourses = () => {
  const [availableCoursesRes, setAvailableCoursesRes] = useState(null);
  const [enrollmentsRes, setEnrollmentsRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
      setError(typeof err === "string" ? err : err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  const availableCourseIds = useMemo(
    () => new Set((courses || []).map((c) => c._id?.toString())),
    [courses]
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
      console.log(sectionsForAvailable)
      const cid = sec.course_id?._id?.toString();
      if (!cid) continue;
      if (!byCourse.has(cid)) {
        byCourse.set(cid, { course: sec.course_id, sections: [] });
      }
      byCourse.get(cid).sections.push(sec);
    }
    return Array.from(byCourse.entries()).map(([courseId, { course, sections: secs }]) => ({
      courseId,
      course,
      sections: secs,
    }));
  }, [sectionsForAvailable]);

  
  

  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return courseGroups;
    console.log(courseGroups)
    const q = searchQuery.trim().toLowerCase();
    return courseGroups.filter((g) => {
      const code = (g.course?.code || "").toLowerCase();
      const title = (g.course?.title || "").toLowerCase();
      return code.includes(q) || title.includes(q);
    });
  }, [courseGroups, searchQuery]);

  const enrolledSectionIds = useMemo(
    () => new Set(enrollments.map((e) => e.section?._id?.toString()).filter(Boolean)),
    [enrollments]
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
      const msg = err?.message || err?.response?.data?.message || "Enrollment failed";
      alert(msg);
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

  if (error) {
    return (
      <div className="vc-container">
        <div className="vc-main">
          <p className="vc-error">{error}</p>
          <button type="button" className="vc-confirm-btn" style={{ maxWidth: 200 }} onClick={fetchData}>
            Retry
          </button>
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
                Select a section per course to enroll. Minimum 12 credits recommended. Max {MAX_CREDITS} credits.
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
                        <h3 className="vc-course-group-code">{course?.code ?? "–"}</h3>
                        <p className="vc-course-group-title">{course?.title ?? ""}</p>
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
                        const roomLabel = sec.room_id?.room_number ?? sec.room_id?.number ?? "–";
                        const timeStr = [sec.day, sec.start_time, sec.end_time].filter(Boolean).join(" ");
                        return (
                          <div key={sec._id} className="vc-section-row">
                            <div className="vc-section-info">
                              <span className="vc-section-num">Sec {sec.sectionNumber}</span>
                              <span className="vc-section-time">{timeStr || "–"}</span>
                              <span>{instructorName}</span>
                              <span>Room {roomLabel}</span>
                              <span>Cap. {sec.capacity}</span>
                            </div>
                            <div className="vc-section-actions">
                              {isEnrolled ? (
                                <>
                                  <span className="vc-section-enrolled-badge">
                                    {enrollment?.status === "Waitlist" ? "Waitlist" : "Enrolled"}
                                  </span>
                                  <button
                                    type="button"
                                    className="vc-section-drop-btn"
                                    disabled={droppingEnrollmentId === enrollment?._id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (enrollment?._id) handleDrop(enrollment._id);
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
                                  {enrollingSectionId === secId ? "Enrolling…" : "Enroll"}
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
                      {e.section?.course_id?.code} – Sec {e.section?.sectionNumber}
                    </h4>
                    <p className="vc-sel-meta">
                      {[e.section?.day, e.section?.start_time, e.section?.end_time]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </div>
                  <div className="vc-sel-right">
                    <span className="vc-sel-cr">{e.section?.course_id?.credits ?? 0} CR</span>
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
                style={{ width: `${Math.min((totalCredits / MAX_CREDITS) * 100, 100)}%` }}
              />
            </div>
            {totalCredits < 12 && totalCredits > 0 && (
              <div className="vc-alert-box">
                <span>ℹ️</span>
                <p className="vc-alert-txt">
                  You have {totalCredits} credits. Full-time minimum is often 12.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCourses;
