import api from "./api";

export const getSlices = async () => {
  const res = await api.get("/registration-slices");
  return res.data;
};

export const createSlice = async (data) => {
  const res = await api.post("/registration-slices", data);
  return res.data;
};

export const updateSlice = async (id, data) => {
  const res = await api.patch(`/registration-slices/${id}`, data);
  return res.data;
};

export const deleteSlice = async (id) => {
  const res = await api.delete(`/registration-slices/${id}`);
  return res.data;
};
