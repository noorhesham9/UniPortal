import api from "./api";

export const getStudents = async () => {
  const res = await api.get("/notifications/students");
  return res.data;
};

export const sendAdvisorNotification = async ({ studentIds, title, body }) => {
  const res = await api.post("/notifications/send", { studentIds, title, body });
  return res.data;
};
