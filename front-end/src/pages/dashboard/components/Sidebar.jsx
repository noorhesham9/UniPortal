import { useState } from "react";
import {
  FiBell,
  FiBook,
  FiCalendar,
  FiChevronDown,
  FiClipboard,
  FiCreditCard,
  FiEdit,
  FiFileText,
  FiHelpCircle,
  FiLayers,
  FiLock,
  FiMessageSquare,
  FiSettings,
  FiUser,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./Sidebar.css";

const categories = [
  // ─── STUDENT ───────────────────────────────────────────────
  {
    id: "student",
    label: "Student",
    roles: ["student"],
    items: [
      { id: "profile",           label: "Personal Info",    icon: <FiUser /> },
      { id: "study_plan_student",label: "Study Plan",       icon: <FiBook /> },
      { id: "Register_Courses",  label: "Register Courses", icon: <FiBook /> },
      { id: "my_enrollments",    label: "My Schedule",      icon: <FiCalendar /> },
      { id: "my_payments",       label: "My Payments",      icon: <FiCreditCard /> },
      { id: "student_chat",      label: "My Advisor",       icon: <FiMessageSquare /> },
      { id: "my_grades",         label: "My Grades",        icon: <FiClipboard /> },
      { id: "academic_record",   label: "Academic Record",  icon: <FiFileText /> },
      { id: "final_results",     label: "Final Results",    icon: <FiFileText /> },
      { id: "notifications",     label: "My Notifications", icon: <FiBell /> },
    ],
  },

  // ─── PROFESSOR ─────────────────────────────────────────────
  {
    id: "professor",
    label: "Teaching",
    roles: ["professor"],
    items: [
      { id: "profile",               label: "Personal Info",      icon: <FiUser /> },
      { id: "course_manage",         label: "My Courses",         icon: <FiBook /> },
      { id: "advisor_chat",          label: "My Students",        icon: <FiMessageSquare /> },
      { id: "advisor_notifications", label: "Send Notification",  icon: <FiBell /> },
      { id: "professor_schedule",    label: "My Schedule",        icon: <FiCalendar /> },
      { id: "year_work_entry",       label: "Year Work Entry",    icon: <FiEdit /> },
      { id: "final_exam_entry",      label: "Final Exam Entry",   icon: <FiClipboard /> },
    ],
  },

  // ─── ADMIN / SUPER_ADMIN ────────────────────────────────────
  {
    id: "admin_general",
    label: "General",
    roles: ["admin", "super_admin"],
    items: [
      { id: "profile",               label: "Personal Info",      icon: <FiUser /> },
      { id: "advisor_chat",          label: "My Students",        icon: <FiMessageSquare /> },
      { id: "advisor_notifications", label: "Send Notification",  icon: <FiBell /> },
    ],
  },
  {
    id: "courses",
    label: "Courses",
    roles: ["admin", "super_admin"],
    items: [
      { id: "create_course",          label: "Create Course",     icon: <FiEdit /> },
      { id: "admin_course_offerings", label: "Course Offerings",  icon: <FiBook /> },
      { id: "Create_setions",         label: "Create Sections",   icon: <FiEdit /> },
      { id: "study_plan_admin",       label: "Edit Study Plan",   icon: <FiEdit /> },
      { id: "schedule_bulider",       label: "Schedule Builder",  icon: <FiCalendar /> },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    roles: ["admin", "super_admin"],
    items: [
      { id: "tuition_approval",    label: "Receipt Approval",    icon: <FiClipboard /> },
      { id: "admin_enrollment",    label: "Enroll Student",      icon: <FiUserPlus /> },
      { id: "all_enrollments",     label: "All Enrollments",     icon: <FiClipboard /> },
      { id: "course_management",   label: "Course Management",   icon: <FiBook /> },
      { id: "admin_departments",   label: "Departments",         icon: <FiLayers /> },
      { id: "Add_Department",      label: "Add Department",      icon: <FiEdit /> },
      { id: "admin_rooms",         label: "Manage Rooms",        icon: <FiLayers /> },
      { id: "add_room",            label: "Add Room",            icon: <FiLayers /> },
      { id: "admin_users_manage",  label: "Manage Users",        icon: <FiUsers /> },
      { id: "Allowed_users",       label: "Allowed Users",       icon: <FiUsers /> },
      { id: "regestration_Slice",  label: "Registration Slice",  icon: <FiEdit /> },
      { id: "settings",            label: "Settings",            icon: <FiSettings /> },
      { id: "ad_management",       label: "Ad Management",       icon: <FiBell /> },
      { id: "admin_college_info",  label: "College Info",        icon: <FiEdit /> },
      { id: "admin_final_lock_status", label: "Final Lock Status",  icon: <FiLock /> },
      { id: "semester_management",     label: "Semester Management", icon: <FiCalendar /> },
    ],
  },
];

function Sidebar({ userPermissions, isStudent, siteLocked }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSection = searchParams.get("section");
  const { user } = useSelector((state) => state.auth);
  const roleName = user?.role?.name || "";

  const [openCats, setOpenCats] = useState(() =>
    Object.fromEntries(categories.map((c) => [c.id, true])),
  );

  const toggleCat = (id) =>
    setOpenCats((prev) => ({ ...prev, [id]: !prev[id] }));

  const nameInitials = user?.name
    ? user.name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join("")
    : "U";

  return (
    <aside className="sidebar">
      <div className="sidebar-user">
        <div className="sidebar-avatar">{nameInitials}</div>
        <div className="sidebar-user-info">
          <span className="sidebar-user-name">{user?.name || "User"}</span>
          <span className="sidebar-user-id">
            ID: {user?.studentId || user?._id?.slice(-8)?.toUpperCase() || "—"}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {categories.map((cat) => {
          // Both admin and super_admin see the same admin sections
          const isAdmin = roleName === "admin" || roleName === "super_admin";
          
          if (!cat.roles.includes(roleName) && !(isAdmin && cat.roles.includes("admin"))) {
            return null;
          }

          // All items visible — permissions commented out for now
          const visibleItems = cat.items;
          if (visibleItems.length === 0) return null;

          const isOpen = openCats[cat.id];

          return (
            <div key={cat.id} className="sidebar-category">
              <button
                className="sidebar-cat-header"
                onClick={() => toggleCat(cat.id)}
              >
                <span className="sidebar-cat-label">{cat.label}</span>
                <FiChevronDown
                  className={`sidebar-cat-chevron${isOpen ? " open" : ""}`}
                />
              </button>

              <div className={`sidebar-cat-items${isOpen ? " open" : ""}`}>
                {visibleItems.map((item) => {
                  const isActive = currentSection === item.id;
                  const isItemLocked =
                    siteLocked && isStudent && item.id !== "profile";
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        !isItemLocked &&
                        navigate(`/dashboard?section=${item.id}`)
                      }
                      className={`sidebar-item${isActive ? " active" : ""}${isItemLocked ? " locked" : ""}`}
                      title={
                        isItemLocked
                          ? "Access restricted — site is locked"
                          : undefined
                      }
                      style={
                        isItemLocked
                          ? { opacity: 0.45, cursor: "not-allowed" }
                          : undefined
                      }
                    >
                      <span className="sidebar-item-icon">{item.icon}</span>
                      <span className="sidebar-item-label">{item.label}</span>
                      {isItemLocked && (
                        <FiLock
                          size={12}
                          style={{ marginLeft: "auto", flexShrink: 0 }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-support">
        <FiHelpCircle className="sidebar-support-icon" />
        <span>Support Center</span>
      </div>
    </aside>
  );
}

export default Sidebar;
