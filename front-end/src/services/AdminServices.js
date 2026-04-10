import api from "./api";

// --- Users ---
export const getUsers = async (role = null) => {
  const url = role ? `/admin/users?role=${role}` : "/admin/users";
  const res = await api.get(url);
  return res.data;
};

export const getAdvisors = async () => {
  // Returns users who have the assign_advisor permission (professors)
  const res = await api.get("/admin/users?role=professor");
  return Array.isArray(res.data) ? res.data : (res.data.users || []);
};

export const assignAdvisor = async (studentId, advisorId) => {
  const res = await api.patch(`/admin/users/${studentId}/assign-advisor`, { advisorId });
  return res.data;
};

export const impersonateUser = async (userId) => {
  const res = await api.post(`/admin/impersonate/${userId}`);
  return res.data;
};

export const stopImpersonation = async () => {
  const res = await api.post("/admin/impersonate/stop");
  return res.data;
};

// --- Departments ---
export const getDepartments = async ({ page = 1, limit = 10, search = "", status = "", sortBy = "createdAt", order = "desc" } = {}) => {
  const params = new URLSearchParams({ page, limit, sortBy, order });
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  const res = await api.get(`/admin/departments?${params}`);
  return res.data;
};

export const createDepartment = async (data) => {
  const res = await api.post("/admin/departments", data);
  return res.data;
};

export const updateDepartment = async (id, data) => {
  const res = await api.patch(`/admin/departments/${id}`, data);
  return res.data;
};

export const deleteDepartment = async (id) => {
  const res = await api.delete(`/admin/departments/${id}`);
  return res.data;
};

// --- Allowed IDs ---
export const getAllowedStudents = async () => {
  const res = await api.get("/admin/allowed_students");
  return res.data;
};

export const addAllowedStudent = async (studentId, note) => {
  const res = await api.post("/admin/allow_Student", { studentId, note });
  return res.data;
};

export const deleteAllowedStudent = async (id) => {
  const res = await api.delete(`/admin/allowed_students/${id}`);
  return res.data;
};
