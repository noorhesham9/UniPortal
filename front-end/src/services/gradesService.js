import api from "./api";

export const getMyGrades = () => api.get("/grades/my").then((r) => r.data);
export const getFinalResults = () => api.get("/grades/results").then((r) => r.data);

export const updateGrades = (enrollmentId, grades_object) =>
  api.patch(`/grades/${enrollmentId}`, { grades_object }).then((r) => r.data);

export const getSectionGrades = (sectionId) =>
  api.get(`/grades/section/${sectionId}`).then((r) => r.data);

export const getAdminFinalLockStatus = () =>
  api.get("/grades/admin/final-lock-status").then((r) => r.data);
