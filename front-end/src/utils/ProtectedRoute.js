import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ requiredPermission }) {
  console.log(
    "ProtectedRoute rendered with requiredPermission:",
    requiredPermission,
  );

  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  console.log("Auth state in ProtectedRoute:", user?.role?.permissions);
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  const userPermissions = user?.role?.permissions || []; // مصفوفة زي ['read_students', 'edit_grades']
  const hasPermission =
    userPermissions.some(
      (permission) => permission.name === requiredPermission,
    ) ||
    requiredPermission === null ||
    requiredPermission === undefined; // السماح بوصول كل المستخدمين للصفحة الرئيسية

  const isAdmin = user?.role?.name === "admin";

  if (!hasPermission && !isAdmin) {
    console.log("Access Denied for:", requiredPermission);
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
