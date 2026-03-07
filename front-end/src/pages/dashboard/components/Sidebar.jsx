import {
  FiBook,
  FiCalendar,
  FiClipboard,
  FiEdit,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { useNavigate, useSearchParams } from "react-router-dom";

function Sidebar({ userPermissions }) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentSection = searchParams.get("section");

  const menuItems = [
    {
      id: "profile",
      label: "الملف الشخصي",
      icon: <FiUser />,
      permission: null,
    },
    {
      id: "all_users",
      label: "إدارة المستخدمين",
      icon: <FiUsers />,
      permission: "view_users",
    },
    {
      id: "view_courses",
      label: " تسجيل مقررات",
      icon: <FiBook />,
      permission: "view_courses",
    },
    {
      id: "schedule_builder",
      label: "بناء الجدول",
      icon: <FiCalendar />,
      permission: "build_schedule",
    },
    {
      id: "view_enrollments",
      label: "التسجيلات",
      icon: <FiClipboard />,
      permission: "view_enrollments",
    },
    {
      id: "update_course",
      label: "تعديل الكورسات",
      icon: <FiEdit />,
      permission: "update_course",
    },
    {
      id: "create_course",
      label: "طرح مقرر جديد",
      icon: <FiEdit />,
      permission: "create_course",
    },
    {
      id: "Allowed_users",
      label: "المستخدمين المسموح لهم",
      icon: <FiEdit />,
      permission: "admin_allowed_ids",
    },
    {
      id: "regestration_Slice",
      label: "شريحه التسجيل",
      icon: <FiEdit />,
      permission: "admin_allowed_ids",
    },
    {
      id: "schedule_bulider",
      label: "schedule_bulider",
      icon: <FiEdit />,
      permission: "admin_allowed_ids",
    },
    {
      id: "Create_setions",
      label: "انشاء مجموعات لمقرر",
      icon: <FiEdit />,
      permission: "admin_allowed_ids",
    },
  ];

  const handleNavigation = (id) => {
    navigate(`/dashboard?section=${id}`);
  };

  return (
    <aside className="dashboard-sidebar">
      <h2 className="dashboard-sidebar-logo">لوحة التحكم</h2>
      <ul style={styles.menuList}>
        {menuItems.map((item) => {
          const hasAccess =
            !item.permission || userPermissions.includes(item.permission);

          if (!hasAccess) return null;

          return (
            <li
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`dashboard-sidebar-item ${currentSection === item.id ? "active" : ""}`}
              style={styles.menuItem}
            >
              <span style={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

const styles = {
  menuList: {
    listStyle: "none",
    padding: 0,
  },
  menuItem: {
    padding: "15px 20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    transition: "background 0.3s",
    fontSize: "1.1rem",
  },
  icon: {
    marginLeft: "15px",
  },
};

export default Sidebar;
