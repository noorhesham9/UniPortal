import { FiBook, FiClipboard, FiEdit, FiUser, FiUsers } from "react-icons/fi";
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
      label: "عرض الكورسات",
      icon: <FiBook />,
      permission: "view_courses",
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
  ];

  const handleNavigation = (id) => {
    navigate(`/dashboard?section=${id}`);
  };

  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.logo}>لوحة التحكم</h2>
      <ul style={styles.menuList}>
        {menuItems.map((item) => {
          // التحقق: هل القسم متاح للكل OR المستخدم يملك الصلاحية المطلوبة؟
          const hasAccess =
            !item.permission || userPermissions.includes(item.permission);

          if (!hasAccess) return null; // إخفاء اللينك تماماً

          return (
            <li
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              style={{
                ...styles.menuItem,
                backgroundColor:
                  currentSection === item.id ? "#34495e" : "transparent",
              }}
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
  sidebar: {
    width: "250px",
    backgroundColor: "#2c3e50",
    color: "white",
    height: "100vh",
    padding: "20px 0",
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    textAlign: "center",
    marginBottom: "30px",
    fontSize: "1.5rem",
    borderBottom: "1px solid #34495e",
    paddingBottom: "10px",
  },
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
