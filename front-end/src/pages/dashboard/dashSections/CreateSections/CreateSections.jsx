import { useEffect, useState } from "react";
import { FaCalendarAlt, FaInfoCircle, FaUsers } from "react-icons/fa";
import { getUsers } from "../../../../services/AdminServices";
import { getAllCourses } from "../../../../services/CourseServices";
import { getRooms } from "../../../../services/RoomServices";
import { createSection } from "../../../../services/SectionServices";
import { getAllSemesters } from "../../../../services/SemesterServices";

const pageStyles = {
  minHeight: "100vh",
  padding: "24px 32px",
  background: "transparent",
  fontFamily:
    '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  color: "hsl(var(--foreground))",
};

const layoutStyles = {
  maxWidth: "1120px",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  gap: "24px",
};

const headerRowStyles = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const breadcrumbStyles = {
  fontSize: "12px",
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "#9ca3af",
  display: "flex",
  alignItems: "center",
  gap: "6px",
};

const titleStyles = {
  fontSize: "28px",
  fontWeight: 600,
  color: "#f9fafb",
};

const subtitleStyles = {
  fontSize: "14px",
  color: "#9ca3af",
};

const mainGridStyles = {
  display: "flex",
  flexWrap: "wrap",
  gap: "24px",
};

const leftColumnStyles = {
  flex: "1 1 60%",
  minWidth: "0",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};

const rightColumnStyles = {
  flex: "1 1 32%",
  minWidth: "260px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};

const cardStyles = {
  background: "hsl(var(--card))",
  borderRadius: "16px",
  padding: "20px 20px 18px",
  border: "1px solid hsl(var(--border))",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
};

const cardHeaderStyles = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "18px",
};

const cardIconCircleStyles = () => ({
  width: "28px",
  height: "28px",
  borderRadius: "999px",
  background: "var(--accent-alt)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "16px",
  color: "hsl(var(--foreground))",
});

const cardTitleStyles = {
  fontSize: "14px",
  fontWeight: 600,
  color: "#f9fafb",
};

const cardSubtitleStyles = {
  fontSize: "12px",
  color: "#6b7280",
};

const fieldGridStyles = {
  display: "flex",
  flexWrap: "wrap",
  gap: "14px 16px",
};

const fieldStyles = {
  flex: "1 1 48%",
  minWidth: "180px",
  display: "flex",
  flexDirection: "column",
  gap: "6px",
};

const labelStyles = {
  fontSize: "12px",
  fontWeight: 500,
  color: "#e5e7eb",
};

const inputBaseStyles = {
  maxWidth: "100%",
  padding: "9px 12px",
  borderRadius: "10px",
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--input))",
  color: "hsl(var(--foreground))",
  fontSize: "13px",
  outline: "none",
  boxShadow: "none",
};

const footerActionsStyles = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "4px",
};

const primaryButtonStyles = {
  padding: "9px 20px",
  borderRadius: "999px",
  border: "none",
  fontSize: "13px",
  fontWeight: 600,
  background: "var(--accent-alt)",
  color: "hsl(var(--foreground))",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  boxShadow: "0 4px 12px rgba(var(--accent-alt-rgb), 0.3)",
};

const secondaryButtonStyles = {
  padding: "9px 18px",
  borderRadius: "999px",
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--muted))",
  color: "hsl(var(--foreground))",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
};

const daysRowStyles = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const dayChipStyles = (active) => ({
  minWidth: "42px",
  padding: "7px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: 500,
  border: active
    ? "1px solid var(--accent-alt)"
    : "1px solid hsl(var(--border))",
  background: active ? "var(--accent-alt)" : "hsl(var(--muted))",
  color: active ? "hsl(var(--foreground))" : "hsl(var(--foreground))",
  cursor: "pointer",
});

const inlineBadgeStyles = {
  fontSize: "11px",
  fontWeight: 500,
  padding: "2px 8px",
  borderRadius: "999px",
  background: "rgba(16, 185, 129, 0.12)",
  color: "#6ee7b7",
};

const tipCardStyles = {
  background: "hsl(var(--card))",
  borderRadius: "14px",
  padding: "14px 14px 13px",
  border: "1px solid hsl(var(--border))",
  display: "flex",
  gap: "10px",
};

const toggleWrapperStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "10px",
};

const toggleStyles = (on) => ({
  width: "42px",
  height: "22px",
  borderRadius: "999px",
  background: on ? "var(--accent-alt)" : "hsl(var(--muted))",
  padding: "2px",
  display: "flex",
  justifyContent: on ? "flex-end" : "flex-start",
  alignItems: "center",
  cursor: "pointer",
});

const toggleThumbStyles = {
  width: "18px",
  height: "18px",
  borderRadius: "999px",
  background: "hsl(var(--card))",
  boxShadow: "0 0 0 1px rgba(0, 0, 0, 0.15)",
};

const CreateSections = () => {
  const [courses, setCourses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [semesters, setSemesters] = useState([]);

  const [formData, setFormData] = useState({
    sectionNumber: "",
    course_id: "",
    semester_id: "",
    instructor_id: "",
    room_id: "",
    day: "",
    start_time: "",
    end_time: "",
    capacity: "",
  });

  const [autoEnrollWaitlist, setAutoEnrollWaitlist] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, instructorsRes, roomsRes, semestersRes] =
          await Promise.all([
            getAllCourses(1, 100),
            getUsers("professor"),
            getRooms(),
            getAllSemesters(),
          ]);
        setCourses(coursesRes.courses || []);
        setInstructors(
          Array.isArray(instructorsRes)
            ? instructorsRes
            : instructorsRes.users || [],
        );
        setRooms(Array.isArray(roomsRes) ? roomsRes : roomsRes.rooms || []);
        setSemesters(
          semestersRes.semesters ||
            (Array.isArray(semestersRes) ? semestersRes : []),
        );
      } catch (error) {
        console.error("Error fetching data:", error);
        setCourses([]);
        setInstructors([]);
        setRooms([]);
        setSemesters([]);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    console.log(e.target.name);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createSection(formData);
      setFormData({
        sectionNumber: "",
        course_id: "",
        semester_id: "",
        instructor_id: "",
        room_id: "",
        day: "",
        start_time: "",
        end_time: "",
        capacity: "",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div style={pageStyles}>
      <div style={layoutStyles}>
        <div style={headerRowStyles}>
          <div style={breadcrumbStyles}>
            <span>Courses</span>
            <span style={{ opacity: 0.45 }}>›</span>
            <span>Offer New Course</span>
          </div>
          <div>
            <div style={titleStyles}>Offer New Course Section</div>
            <div style={subtitleStyles}>
              Specify details for creating a new offering for the upcoming
              semester.
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={mainGridStyles}>
            <div style={leftColumnStyles}>
              <div style={cardStyles}>
                <div style={cardHeaderStyles}>
                  <div style={cardIconCircleStyles("#38bdf8")}>ⓘ</div>
                  <div>
                    <div style={cardTitleStyles}>Basic Information</div>
                    <div style={cardSubtitleStyles}>
                      Select catalog details for the new section.
                    </div>
                  </div>
                </div>

                <div style={fieldGridStyles}>
                  <div style={fieldStyles}>
                    <label style={labelStyles}>Select Course</label>
                    <select
                      name="course_id"
                      value={formData.course_id}
                      onChange={handleChange}
                      required
                      style={{
                        ...inputBaseStyles,
                        appearance: "none",
                      }}
                    >
                      <option value="">
                        Search for a course catalog item…
                      </option>
                      {courses.length === 0 ? (
                        <option value="">
                          No courses found... Please create a course first
                        </option>
                      ) : (
                        courses.map((course) => (
                          <option key={course._id} value={course._id}>
                            {course.title} ({course.code})
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div style={fieldStyles}>
                    <label style={labelStyles}>Section Number</label>
                    <input
                      name="sectionNumber"
                      value={formData.sectionNumber}
                      onChange={handleChange}
                      type="text"
                      placeholder="e.g. 001"
                      style={inputBaseStyles}
                    />
                  </div>

                  <div style={fieldStyles}>
                    <label style={labelStyles}>Semester</label>
                    <select
                      name="semester_id"
                      value={formData.semester_id}
                      onChange={handleChange}
                      required
                      style={{
                        ...inputBaseStyles,
                        appearance: "none",
                      }}
                    >
                      <option value="">Select semester</option>
                      {semesters.map((sem) => (
                        <option key={sem._id} value={sem._id}>
                          {sem.year} {sem.term}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={fieldStyles}>
                    <label style={labelStyles}>Instructor</label>
                    <select
                      name="instructor_id"
                      value={formData.instructor_id}
                      onChange={handleChange}
                      required
                      style={{
                        ...inputBaseStyles,
                        appearance: "none",
                      }}
                    >
                      <option value="">Select Faculty Member</option>
                      {instructors.length === 0 ? (
                        <option value="">
                          No instructors found... Please create an instructor
                          first
                        </option>
                      ) : (
                        instructors.map((inst) => (
                          <option key={inst._id} value={inst._id}>
                            {inst.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div style={cardStyles}>
                <div style={cardHeaderStyles}>
                  <div style={cardIconCircleStyles("#22c55e")}>
                    <FaCalendarAlt size={16} />
                  </div>
                  <div>
                    <div style={cardTitleStyles}>Schedule &amp; Location</div>
                    <div style={cardSubtitleStyles}>
                      Configure meeting pattern and room assignment.
                    </div>
                  </div>
                  <span style={{ marginLeft: "auto", ...inlineBadgeStyles }}>
                    Live conflict checks
                  </span>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <div
                    style={{
                      ...labelStyles,
                      marginBottom: "6px",
                    }}
                  >
                    Days of the Week
                  </div>
                  <div style={daysRowStyles}>
                    {days.map((d) => (
                      <button
                        key={d}
                        type="button"
                        style={dayChipStyles(formData.day === d)}
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            day: prev.day === d ? "" : d,
                          }))
                        }
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={fieldGridStyles}>
                  <div style={fieldStyles}>
                    <label style={labelStyles}>Start Time</label>
                    <input
                      type="time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleChange}
                      required
                      style={inputBaseStyles}
                    />
                  </div>
                  <div style={fieldStyles}>
                    <label style={labelStyles}>End Time</label>
                    <input
                      type="time"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleChange}
                      required
                      style={inputBaseStyles}
                    />
                  </div>
                </div>

                <div style={{ ...fieldStyles, marginTop: "10px" }}>
                  <label style={labelStyles}>Location / Room</label>
                  <select
                    name="room_id"
                    value={formData.room_id}
                    onChange={handleChange}
                    required
                    style={{
                      ...inputBaseStyles,
                      appearance: "none",
                    }}
                  >
                    <option value="">Select room or lab</option>
                    {rooms.map((room) => (
                      <option key={room._id} value={room._id}>
                        {room.room_name} ({room.type})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={rightColumnStyles}>
              <div style={cardStyles}>
                <div style={cardHeaderStyles}>
                  <div style={cardIconCircleStyles("#f97316")}>
                    <FaUsers size={16} />
                  </div>
                  <div>
                    <div style={cardTitleStyles}>Enrollment</div>
                    <div style={cardSubtitleStyles}>
                      Control max seats and waitlist behavior.
                    </div>
                  </div>
                </div>

                <div style={fieldStyles}>
                  <label style={labelStyles}>Max Capacity</label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleChange}
                      required
                      min="1"
                      style={{
                        ...inputBaseStyles,
                        flex: "0 0 90px",
                      }}
                    />
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#9ca3af",
                      }}
                    >
                      Students
                    </span>
                  </div>
                </div>

                <div style={toggleWrapperStyles}>
                  <div>
                    <div style={labelStyles}>Auto-enroll Waitlist</div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#6b7280",
                        marginTop: "2px",
                      }}
                    >
                      Fill spots from waitlist automatically.
                    </div>
                  </div>
                  <div
                    style={toggleStyles(autoEnrollWaitlist)}
                    onClick={() => setAutoEnrollWaitlist((prev) => !prev)}
                  >
                    <div style={toggleThumbStyles} />
                  </div>
                </div>
              </div>

              <div style={tipCardStyles}>
                <div
                  style={{
                    width: "26px",
                    height: "26px",
                    borderRadius: "999px",
                    background: "var(--accent-alt)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "hsl(var(--foreground))",
                    fontWeight: 700,
                    fontSize: "14px",
                    flexShrink: 0,
                  }}
                >
                  <FaInfoCircle size={16} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "var(--accent-alt)",
                      marginBottom: "2px",
                    }}
                  >
                    Admin Tip
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      color: "hsl(var(--muted-foreground))",
                      lineHeight: 1.45,
                    }}
                  >
                    Offering this course will notify all students who have it in
                    their academic plan or wishlist for the selected semester.
                  </div>
                </div>
              </div>

              <div style={footerActionsStyles}>
                <button
                  type="button"
                  style={secondaryButtonStyles}
                  onClick={() => {
                    setFormData({
                      course_id: "",
                      semester_id: "",
                      instructor_id: "",
                      room_id: "",
                      day: "",
                      start_time: "",
                      end_time: "",
                      capacity: "",
                    });
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    ...primaryButtonStyles,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  <span>Offer Course</span>
                  <span style={{ fontSize: "16px", marginTop: "1px" }}>●</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSections;
