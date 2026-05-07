import api from "./api";

// --- Users ---
export const getUsers = async ({
  role = "",
  search = "",
  page = 1,
  limit = 15,
  sort = "name",
  order = "asc",
  status = "",
} = {}) => {
  const params = new URLSearchParams({ page, limit, sort, order });
  if (role) params.append("role", role);
  if (search) params.append("search", search);
  if (status) params.append("status", status);
  const res = await api.get(`/admin/users?${params}`);
  return res.data; // { users, total, page, totalPages, limit }
};

export const getAdvisors = async () => {
  const res = await api.get("/admin/users?role=professor&limit=200");
  const data = res.data;
  return Array.isArray(data) ? data : data.users || [];
};

export const assignAdvisor = async (studentId, advisorId) => {
  const res = await api.patch(`/admin/users/${studentId}/assign-advisor`, {
    advisorId,
  });
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
export const getDepartments = async ({
  page = 1,
  limit = 10,
  search = "",
  status = "",
  sortBy = "createdAt",
  order = "desc",
} = {}) => {
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

export const addAllowedStudent = async ({
  studentId,
  nationalId,
  examSeatNumber,
  email,
}) => {
  const res = await api.post("/admin/allow_Student", {
    studentId,
    nationalId,
    examSeatNumber,
    email,
  });
  return res.data;
};

export const deleteAllowedStudent = async (id) => {
  const res = await api.delete(`/admin/allowed_students/${id}`);
  return res.data;
};

// --- Registration Requests ---
export const getRegistrationRequests = async (status = "pending_approval") => {
  const res = await api.get(`/registration-requests?status=${status}`);
  return res.data;
};

export const reviewRegistrationRequest = async (id, action, adminNote = "") => {
  const res = await api.patch(`/registration-requests/${id}/review`, {
    action,
    adminNote,
  });
  return res.data;
};

export const getIdCardSignedUrl = async (requestId) => {
  const res = await api.get(`/registration-requests/${requestId}/id-card-url`);
  return res.data; // { url, expiresIn }
};
