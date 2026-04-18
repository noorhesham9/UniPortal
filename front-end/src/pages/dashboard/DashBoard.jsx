import { useEffect, useState } from "react";
import { FiLock } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSocket } from "../../context/SocketContext";
import { stopImpersonation } from "../../services/AdminServices";
import { getSiteLock } from "../../services/CourseServices";
import { stopImpersonation as stopImpersonationAction } from "../../services/store/reducers/authSlice";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import "./DashBoard.css";
import AcademicRecords from "./dashSections/AcademicRecords";
import AddDepartment from "./dashSections/AddDepartment/AddDepartment";
import AdminCourseOfferings from "./dashSections/AdminCourseOfferings/AdminCourseOfferings";
import AdminDepartments from "./dashSections/AdminDepartments/AdminDepartments";
import EditDepartment from "./dashSections/AdminDepartments/EditDepartment";
import AdminEnrollment from "./dashSections/AdminEnrollment/AdminEnrollment";
import AdminRooms from "./dashSections/AdminRooms/AdminRooms";
import AdminUsers from "./dashSections/AdminUsers/AdminUsers";
import AdvisorChat from "./dashSections/AdvisorChat/AdvisorChat";
import AdvisorNotifications from "./dashSections/AdvisorNotifications/AdvisorNotifications";
import AllEnrollments from "./dashSections/AllEnrollments/AllEnrollments";
import AllowedIDS from "./dashSections/allowedIDS/AllowedIDS";
import CourseManage from "./dashSections/CourseManage/CourseManage";
import CourseManagement from "./dashSections/CourseManagement/CourseManagement";
import CreateCourse from "./dashSections/createCourse/CreateCourse";
import CreateSections from "./dashSections/CreateSections/CreateSections";
import EditCourse from "./dashSections/EditCourse/EditCourse";
import EditProfile from "./dashSections/EditProfile/EditProfile";
import MyEnrollments from "./dashSections/MyEnrollments/MyEnrollments";
import MyPayments from "./dashSections/MyPayments/MyPayments";
import Profile from "./dashSections/Profile/Profile";
import RegisterCourses from "./dashSections/registerCourse/RegiseterCourse";
import RegistrationSlices from "./dashSections/RegistrationSlices/RegistrationSlices";
import AddRoom from "./dashSections/RoomManagement/AddRoom";
import EditRoom from "./dashSections/RoomManagement/EditRoom";
import ScheduleBuilder from "./dashSections/ScheduleBuilder/ScheduleBuilder";
import Settings from "./dashSections/Settings/Settings";
import StudentChat from "./dashSections/StudentChat/StudentChat";
import StudyPlanAdmin from "./dashSections/StudyPlanAdmin/StudyPlanAdmin";
import StudyPlanStudent from "./dashSections/StudyPlanStudent/StudyPlanStudent";
import TuitionApproval from "./dashSections/TuitionApproval/TuitionApproval";
import ViewEnrollment from "./dashSections/ViewEnrollment";
import AdminCollegeInfo from "./dashSections/AdminCollegeInfo/AdminCollegeInfo";
import MyGrades from "./dashSections/MyGrades/MyGrades";
import FinalResults from "./dashSections/FinalResults/FinalResults";
import FinalExamEntry from "./dashSections/FinalExamEntry/FinalExamEntry";
import YearWorkEntry from "./dashSections/YearWorkEntry/YearWorkEntry";
import AdManagement from "./dashSections/AdManagement/AdManagement";
import SemesterManagement from "./dashSections/SemesterManagement/SemesterManagement";
import AdminFinalLockStatus from "./dashSections/AdminFinalLockStatus/AdminFinalLockStatus";
import AcademicRecord from "./dashSections/AcademicRecord/AcademicRecord";
import Notifications from "./dashSections/Notifications/Notifications";
import ProfessorSchedule from "./dashSections/ProfessorSchedule/ProfessorSchedule";

function DashBoard() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const section = searchParams.get("section");

  const { user, impersonating } = useSelector((state) => state.auth);

  const handleStopImpersonation = async () => {
    try {
      await stopImpersonation();
      dispatch(stopImpersonationAction());
    } catch (e) {
      console.error(e);
    }
  };

  const userPermissions = user?.role?.permissions?.map((p) => p.name) || [];
  const roleName = user?.role?.name || "";
  const isStudent = roleName === "student";
  const isSuperAdmin = roleName === "super_admin";

  const socket = useSocket();
  const [siteLocked, setSiteLocked] = useState(false);

  useEffect(() => {
    if (!isStudent) return;
    getSiteLock()
      .then((d) => setSiteLocked(d.locked))
      .catch((err) => console.error(err));
  }, [isStudent]);

  useEffect(() => {
    if (!isStudent || !socket) return;
    const handleLockChange = ({ locked }) => {
      setSiteLocked(locked);
    };

    socket.on("site_lock_changed", handleLockChange);
    return () => socket.off("site_lock_changed", handleLockChange);
  }, [isStudent, socket]);

  const can = (permission) =>
    !isStudent && (isSuperAdmin || userPermissions.includes(permission));
  const studentCan = (permission) =>
    isStudent && userPermissions.includes(permission);

  const roomId = searchParams.get("id");

  const standaloneSection = section === "edit_profile";

  const renderSection = () => {
    if (siteLocked && isStudent && section !== "profile") {
      return <SiteLocked />;
    }

    switch (section) {
      case "profile":
        return <Profile user={user} siteLocked={siteLocked && isStudent} />;

      case "Register_Courses":
        return (isStudent || isSuperAdmin) &&
          (studentCan("view_courses") || isSuperAdmin) ? (
          <RegisterCourses />
        ) : (
          <Denied />
        );
      case "study_plan_student":
        return <StudyPlanStudent />;

      case "my_payments":
        return isStudent ? <MyPayments /> : <Denied />;

      case "my_enrollments":
        return isStudent ? <MyEnrollments /> : <Denied />;

      case "student_chat":
        return isStudent || isSuperAdmin ? <StudentChat /> : <Denied />;

      case "update_course":
        return can("update_course") ? <EditCourse /> : <Denied />;

      case "course_manage":
        return can("view_courses") ? <CourseManage /> : <Denied />;

      case "create_course":
        return can("create_course") ? <CreateCourse /> : <Denied />;

      case "view_enrollments":
        return can("view_enrollments") ? <ViewEnrollment /> : <Denied />;

      case "Allowed_users":
        return can("admin_allowed_ids") ? <AllowedIDS /> : <Denied />;

      case "schedule_bulider":
        return can("create_section") ? <ScheduleBuilder /> : <Denied />;

      case "add_room":
        return can("manage_rooms") ? <AddRoom /> : <Denied />;

      case "edit_room":
        return userPermissions.includes("manage_rooms") ? (
          <EditRoom roomId={roomId} />
        ) : (
          <div className="error">عذراً، ليس لديك صلاحية لتعديل الغرف</div>
        );
      case "academic_records":
        return <AcademicRecords />;
        return can("manage_rooms") ? <EditRoom roomId={roomId} /> : <Denied />;

      case "Add_Department":
        return can("create_department") ? <AddDepartment /> : <Denied />;

      case "Create_setions":
        return can("create_section") ? <CreateSections /> : <Denied />;

      case "study_plan_admin":
        return can("update_course") ? <StudyPlanAdmin /> : <Denied />;

      case "admin_departments":
        return can("view_departments") ? <AdminDepartments /> : <Denied />;

      case "edit_department":
        return can("update_department") ? <EditDepartment /> : <Denied />;

      case "admin_course_offerings":
        return can("view_courses") ? <AdminCourseOfferings /> : <Denied />;

      case "admin_rooms":
        return can("manage_rooms") ? <AdminRooms /> : <Denied />;

      case "admin_users_manage":
        return can("view_users") ? <AdminUsers /> : <Denied />;

      case "regestration_Slice":
        return can("create_registration_slice") ? (
          <RegistrationSlices />
        ) : (
          <Denied />
        );
      case "admin_enrollment":
        return can("view_enrollments") ? <AdminEnrollment /> : <Denied />;

      case "all_enrollments":
        return can("view_enrollments") ? <AllEnrollments /> : <Denied />;

      case "settings":
        return isSuperAdmin ? <Settings /> : <Denied />;

      case "tuition_approval":
        return can("manage_tuition") ? <TuitionApproval /> : <Denied />;

      case "course_management":
        return can("manage_courses") ? <CourseManagement /> : <Denied />;

      case "advisor_chat":
        return roleName === "professor" ||
          roleName === "admin" ||
          roleName === "super_admin" ? (
          <AdvisorChat />
        ) : (
          <Denied />
        );
      case "advisor_notifications":
        return roleName === "professor" ||
          roleName === "admin" ||
          roleName === "super_admin" ? (
          <AdvisorNotifications />
        ) : (
          <Denied />
        );
      case "ad_management":
        return can("view_users") ? <AdManagement /> : <Denied />;

      case "my_grades":
        return isStudent ? <MyGrades /> : <Denied />;

      case "academic_record":
        return isStudent ? <AcademicRecord /> : <Denied />;

      case "final_results":
        return isStudent ? <FinalResults /> : <Denied />;

      case "notifications":
        return isStudent ? <Notifications /> : <Denied />;

      case "professor_schedule":
        return can("view_sections") ? <ProfessorSchedule /> : <Denied />;

      case "final_exam_entry":
        return can("view_sections") ? <FinalExamEntry /> : <Denied />;

      case "year_work_entry":
        return can("view_sections") ? <YearWorkEntry /> : <Denied />;

      case "ad_management":
        return can("view_users") ? <AdManagement /> : <Denied />;

      case "admin_college_info":
        return can("view_users") ? <AdminCollegeInfo /> : <Denied />;

      case "admin_final_lock_status":
        return can("view_sections") ? <AdminFinalLockStatus /> : <Denied />;

      case "semester_management":
        return can("view_users") ? <SemesterManagement /> : <Denied />;

      case "edit_profile":
        return <EditProfile />;

      default:
        return <Profile user={user} />;
    }
  };

  const getHeaderActions = () => {
    if (section === "edit_profile") {
      return (
        <div className="header-page-actions">
          <button
            className="header-btn-cancel"
            onClick={() => navigate("/dashboard?section=profile")}
          >
            Cancel
          </button>

          <button
            className="header-btn-primary"
            onClick={() => document.getElementById("ep-save-trigger")?.click()}
          >
            Save Changes
          </button>
        </div>
      );
    }
    return null;
  };

  if (standaloneSection) {
    return (
      <div className="dashboard-root">
        <Sidebar
          userPermissions={userPermissions}
          isStudent={isStudent}
          siteLocked={siteLocked}
        />
        <div className="dashboard-body">
          <Header actions={getHeaderActions()} />
          {impersonating && (
            <ImpersonateBanner onStop={handleStopImpersonation} user={user} />
          )}
          <main className="dashboard-main">{renderSection()}</main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <Sidebar
        userPermissions={userPermissions}
        isStudent={isStudent}
        siteLocked={siteLocked}
      />
      <div className="dashboard-body">
        <Header actions={getHeaderActions()} />
        {impersonating && (
          <ImpersonateBanner onStop={handleStopImpersonation} user={user} />
        )}
        <main className="dashboard-main">{renderSection()}</main>
        <Footer />
      </div>
    </div>
  );
}

const ImpersonateBanner = ({ onStop, user }) => (
  <div className="impersonate-banner">
    <span>
      ⚠️ Impersonating <strong>{user?.name}</strong> ({user?.role?.name})
    </span>
    <button className="impersonate-stop-btn" onClick={onStop}>
      ✕ Stop Impersonating
    </button>
  </div>
);

const Denied = () => (
  <div className="dash-denied">
    You don't have permission to view this section.
  </div>
);

const SiteLocked = () => (
  <div
    className="dash-denied"
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "12px",
      padding: "60px 20px",
    }}
  >
    <FiLock size={48} style={{ color: "#e53e3e" }} />
    <h3 style={{ margin: 0 }}>Registration is Currently Closed</h3>
    <p style={{ margin: 0, color: "#718096", textAlign: "center" }}>
      The system is temporarily locked by the administration.
      <br />
      You can still view your profile while access is restricted.
    </p>
  </div>
);

export default DashBoard;
