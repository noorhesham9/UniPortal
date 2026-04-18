import { Navigate, Route, Routes } from "react-router-dom";
import DashBoard from "../pages/dashboard/DashBoard";
import CourseSchedule from "../pages/dashboard/dashSections/CreateSections/CreateSections";
import EditCourse from "../pages/dashboard/dashSections/EditCourse/EditCourse";
import Profile from "../pages/dashboard/dashSections/EditProfile/EditProfile";
import RegistrationSlices from "../pages/dashboard/dashSections/RegistrationSlices/RegistrationSlices";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import VerifyEmail from "../pages/Register/VerifyEmail";
import RegisterComplete from "../pages/Register/RegisterComplete";
import RequestStatus from "../pages/Register/RequestStatus";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import Unauthorized from "../pages/unAuthorized/Unauthorized";
import InactivePage from "../pages/Inactive/InactivePage";
import ProtectedRoute from "../utils/ProtectedRoute";
import HomePage from "../pages/Home/Home";
import DepartmentsPage from "../pages/Departments/DepartmentsPage";
import AboutPage from "../pages/About/AboutPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/departments" element={<DepartmentsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/activate" element={<RegisterComplete />} />
      <Route path="/register/status" element={<RequestStatus />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/inactive" element={<InactivePage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/Course-Schedule" element={<CourseSchedule />} />
        <Route path="/registration-slices" element={<RegistrationSlices />} />
        <Route path="/edit-course" element={<EditCourse />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
