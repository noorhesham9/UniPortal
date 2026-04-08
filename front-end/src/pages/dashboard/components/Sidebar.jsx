import { useState } from "react";
import {
  FiBook,
  FiBell,
  FiCalendar,
  FiChevronDown,
  FiClipboard,
  FiCreditCard,
  FiEdit,
  FiHelpCircle,
  FiLayers,
  FiLock,
  FiMessageSquare,
  FiSettings,
  FiUser,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Sidebar.css";

const categories = [
  {
    id: "student",
    label: "Student",
    roles: ["student"],
    items: [
      { id: "profile",            label: "Personal Info",    icon: <FiUser />,          permission: null },
      { id: "study_plan_student", label: "Study Plan",       icon: <FiBook />,          permission: null },
      { id: "Register_Courses",   label: "Register Courses", icon: <FiBook />,          permission: "view_courses" },
      { id: "my_enrollments",     label: "My Schedule",      icon: <FiCalendar />,      permission: null },
      { id: "my_payments",        label: "My Payments",      icon: <FiCreditCard />,    permission: null },
      { id: "student_chat",       label: "My Advisor",       icon: <FiMessageSquare />, permission: null },
    ],
  },
  {
    id: "professor",
    label: "Teaching",
    roles: ["professor"],
    items: [
      { id: "profile",                 label: "Personal Info",      icon: <FiUser />,          permission: null },
      { id: "course_manage",           label: "My Courses",         icon: <FiBook />,          permission: "view_courses" },
      { id: "advisor_chat",            label: "My Students",        icon: <FiMessageSquare />, permission: "view_sections" },
      { id: "advisor_notifications",   label: "Send Notification",  icon: <FiBell />,          permission: "view_sections" },
    ],
  },
  {
    id: "courses",
    label: "Courses",
    roles: ["admin", "super_admin"],
    items: [
      { id: "create_course",          label: "Create Course",    icon: <FiEdit />, permission: "create_course" },
      { id: "admin_course_offerings", label: "Course Offerings", icon: <FiBook />, permission: "view_courses" },
      { id: "Create_setions",         label: "Create Sections",  icon: <FiEdit />, permission: "create_section" },
      { id: "study_plan_admin",       label: "Edit Study Plan",  icon: <FiEdit />, permission: "update_course" },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    roles: ["admin", "super_admin"],
    items: [
      { id: "tuition_approval",      label: "Receipt Approval",   icon: <FiClipboard />,    permission: "manage_tuition" },
      { id: "admin_enrollment",      label: "Enroll Student",     icon: <FiUserPlus />,     permission: "view_enrollments" },
      { id: "all_enrollments",       label: "All Enrollments",    icon: <FiClipboard />,    permission: "view_enrollments" },
      { id: "course_management",     label: "Course Management",  icon: <FiBook />,         permission: "manage_courses" },
      { id: "admin_departments",     label: "Departments",        icon: <FiLayers />,       permission: "view_departments" },
      { id: "Add_Department",        label: "Add Department",     icon: <FiEdit />,         permission: "create_department" },
      { id: "admin_rooms",           label: "Manage Rooms",       icon: <FiLayers />,       permission: "manage_rooms" },
      { id: "add_room",              label: "Add Room",           icon: <FiLayers />,       permission: "manage_rooms" },
      { id: "admin_users_manage",    label: "Manage Users",       icon: <FiUsers />,        permission: "view_users" },
      { id: "Allowed_users",         label: "Allowed Users",      icon: <FiUsers />,        permission: "admin_allowed_ids" },
      { id: "regestration_Slice",    label: "Registration Slice", icon: <FiEdit />,         permission: "create_registration_slice" },
      { id: "settings",              label: "Settings",           icon: <FiSettings />,     permission: "create_registration_slice" },
      { id: "schedule_bulider",      label: "Schedule Builder",   icon: <FiCalendar />,     permission: "create_section" },
      { id: "advisor_chat",          label: "My Students",        icon: <FiMessageSquare />,permission: "view_users" },
      { id: "advisor_notifications", label: "Send Notification",  icon: <FiBell />,         permission: "view_users" },
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
    Object.fromEntries(categories.map((c) => [c.id, true]))
  );

  const toggleCat = (id) =>
    setOpenCats((prev) => ({ ...prev, [id]: !prev[id] }));

  const nameInitials = user?.name
    ? user.name.split(" ").slice(0, 2).map((n) => n[0].toUpperCase()).join("")
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
          if (roleName === "super_admin") {
            // no filtering — show all
          } else if (!cat.roles.includes(roleName)) {
            return null;
          }

          const visibleItems = cat.items.filter(
            (item) => !item.permission || userPermissions.includes(item.permission)
          );
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
                  const isItemLocked = siteLocked && isStudent && item.id !== "profile";
                  return (
                    <button
                      key={item.id}
                      onClick={() => !isItemLocked && navigate(`/dashboard?section=${item.id}`)}
                      className={`sidebar-item${isActive ? " active" : ""}${isItemLocked ? " locked" : ""}`}
                      title={isItemLocked ? "Access restricted — site is locked" : undefined}
                      style={isItemLocked ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
                    >
                      <span className="sidebar-item-icon">{item.icon}</span>
                      <span className="sidebar-item-label">{item.label}</span>
                      {isItemLocked && <FiLock size={12} style={{ marginLeft: "auto", flexShrink: 0 }} />}
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