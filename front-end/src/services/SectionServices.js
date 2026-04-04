import api from "./api";

export const createSection = async (data) => {
  const res = await api.post("/sections", data);
  return res.data;
};

export const getSections = async (semesterId, courseId = null) => {
  const params = new URLSearchParams({ semesterId });
  if (courseId) params.append("courseId", courseId);
  const res = await api.get(`/sections?${params}`);
  return res.data;
};

export const getMySections = async (semesterId = null) => {
  const params = semesterId ? `?semesterId=${semesterId}` : "";
  const res = await api.get(`/sections/my${params}`);
  return res.data;
};
