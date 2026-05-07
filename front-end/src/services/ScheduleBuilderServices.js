import api from "./api";

export const getResources = (departmentId, semesterId) =>
  api
    .get("/schedule-generator/resources", {
      params: { departmentId, semesterId },
    })
    .then((r) => r.data.resources);

export const getSectionsBySemester = (semesterId) =>
  api.get("/sections", { params: { semesterId } }).then((r) => r.data.sections);

export const createSection = (data) =>
  api.post("/sections", data).then((r) => r.data);

export const updateSection = (id, data) =>
  api.patch(`/sections/${id}`, data).then((r) => r.data);

export const deleteSection = (id) =>
  api.delete(`/sections/${id}`).then((r) => r.data);
