import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import AllUsers from "./dashSections/AllUsers";
import Profile from "./dashSections/Profile/Profile";
import UpdateCourse from "./dashSections/UpdateCourse";
import ViewCourses from "./dashSections/ViewCourses";
import ViewEnrollment from "./dashSections/ViewEnrollment";
import AllowedIDS from "./dashSections/allowedIDS/AllowedIDS";

function DashBoard() {
  const [searchParams] = useSearchParams();
  const section = searchParams.get("section");

  const { user } = useSelector((state) => state.auth);
  const userPermissions = user?.role?.permissions?.map((p) => p.name) || [];

  console.log("User Permissions in Dashboard:", user);
  const renderProtectedSection = () => {
    switch (section) {
      case "profile":
        // البروفايل غالباً متاح للكل
        return <Profile user={user} />;
      case "view_courses":
        return userPermissions.includes("view_courses") ? (
          <ViewCourses />
        ) : (
          <div className="error">عذراً، ليس لديك صلاحية لرؤية الكورسات</div>
        );
      case "update_course":
        return userPermissions.includes("update_course") ? (
          <UpdateCourse />
        ) : (
          <div className="error">عذراً، ليس لديك صلاحية لتعديل الكورسات</div>
        );
      case "view_enrollments":
        return userPermissions.includes("view_enrollments") ? (
          <ViewEnrollment />
        ) : (
          <div className="error">عذراً، ليس لديك صلاحية لرؤية التسجيلات</div>
        );
      case "all_users":
        return userPermissions.includes("view_users") ? (
          <AllUsers />
        ) : (
          <div className="error">عذراً، ليس لديك صلاحية لرؤية المستخدمين</div>
        );
      case "Allowed_users":
        return userPermissions.includes("admin_allowed_ids") ? (
          <AllowedIDS />
        ) : (
          <div className="error">
            عذراً، ليس لديك صلاحية لرؤية المستخدمين المسموح لهم
          </div>
        );

      default:
        return (
          <div className="welcome-msg">
            <h2>أهلاً بك، {user?.name}</h2>
            <p>اختر من القائمة الجانبية للبدء</p>
          </div>
        );
    }
  };
  return (
    <div style={{ display: "flex" }}>
      <Sidebar userPermissions={userPermissions} />
      <main style={{ flex: 1 }}>{renderProtectedSection()}</main>
    </div>
  );
}
export default DashBoard;
