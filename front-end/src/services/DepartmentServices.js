import api from "./api";

export const createDepartment = async (data) => {
  const res = await api.post("/admin/departments", data);
  return res.data;
};

export const getDepartments = async () => {
  const res = await api.get("/admin/departments");
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
