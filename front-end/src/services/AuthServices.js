import api from "./api";

export const loginWithToken = async (idToken) => {
  const res = await api.post("/auth/login", { idToken });
  return res.data;
};

export const registerWithToken = async ({ idToken, studentId, name, email }) => {
  const res = await api.post("/auth/register", { idToken, studentId, name, email });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};

export const logoutApi = async () => {
  const res = await api.get("/auth/logout");
  return res.data;
};
