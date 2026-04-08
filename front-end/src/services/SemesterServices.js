import api from "./api";

export const getAllSemesters = async () => {
  const res = await api.get("/semesters");
  return res.data;
};

export const createSemester = async (data) => {
  const res = await api.post("/semesters", data);
  return res.data;
};

export const updateSemester = async (id, data) => {
  const res = await api.patch(`/semesters/${id}`, data);
  return res.data;
};

export const deleteSemester = async (id) => {
  const res = await api.delete(`/semesters/${id}`);
  return res.data;
};
