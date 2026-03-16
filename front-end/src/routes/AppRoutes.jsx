import { Navigate, Route, Routes } from "react-router-dom";
import Profile from "../pages/Profile/Profile";
import DashBoard from "../pages/dashboard/DashBoard";
import CourseSchedule from "../pages/dashboard/dashSections/CreateSections/CreateSections";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import RegistrationSlices from "../pages/RegistrationSlices/RegistrationSlices";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import Unauthorized from "../pages/unAuthorized/Unauthorized";
import ProtectedRoute from "../utils/ProtectedRoute";
import EditCourse from '../pages/EditCourse/EditCourse';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/profile"element={<Profile/>}/>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
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
