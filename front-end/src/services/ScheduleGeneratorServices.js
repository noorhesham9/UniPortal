import api from "./api";

export const getAvailableResources = async (departmentId, semesterId) => {
  const params = {};
  if (departmentId) params.departmentId = departmentId;
  if (semesterId) params.semesterId = semesterId;

  const res = await api.get("/schedule-generator/resources", { params });
  return res.data;
};

export const generateSchedules = async (data) => {
  const res = await api.post("/schedule-generator/generate", data);
  return res.data;
};

export const validateSchedule = async (schedule) => {
  const res = await api.post("/schedule-generator/validate", { schedule });
  return res.data;
};

export const saveSchedule = async (schedule, semesterId) => {
  const res = await api.post("/schedule-generator/save", {
    schedule,
    semesterId,
  });
  return res.data;
};
