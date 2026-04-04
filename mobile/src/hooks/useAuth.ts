import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);

  const roleName = user?.role?.name || user?.role || "";

  return {
    user,
    isAdmin: ["admin", "super_admin"].includes(roleName),
    isAuthenticated,
  };
};