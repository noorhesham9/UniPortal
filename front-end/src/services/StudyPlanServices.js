import api from "./api";

export const getStudyPlanCourses = async (params) => {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
  ).toString();
  const res = await api.get(`/study-plan?${query}`);
  return res.data;
};

export const addCourseToStudyPlan = async (body) => {
  const res = await api.post("/study-plan", body);
  return res.data;
};

export const updateStudyPlanEntry = async (entryId, body) => {
  const res = await api.patch(`/study-plan/${entryId}`, body);
  return res.data;
};

export const removeCourseFromStudyPlan = async (entryId) => {
  const res = await api.delete(`/study-plan/${entryId}`);
  return res.data;
};

export const getActiveDepartments = async () => {
  const res = await api.get("/departments");
  return res.data; // { success, departments }
};
