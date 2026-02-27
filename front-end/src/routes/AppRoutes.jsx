import { Navigate, Route, Routes } from "react-router-dom";
import DashBoard from "../pages/dashboard/DashBoard";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import Login from "../pages/Login/Login";
import Proff from "../pages/proff/Proff";
import Register from "../pages/Register/Register";
import ResetPassword from "../pages/ResetPassword/ResetPassword";
import Unauthorized from "../pages/unAuthorized/Unauthorized";
import ProtectedRoute from "../utils/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashBoard />} />
        <Route path="/proff" element={<Proff />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
};

export default AppRoutes;
