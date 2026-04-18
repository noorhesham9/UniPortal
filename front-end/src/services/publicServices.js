import api from "./api";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:3100/api/v1";

// Uses fetch so no auth cookie/token is sent for public endpoints
export const getPublicAnnouncements = async () => {
  const res = await fetch(`${BASE}/announcements/public`);
  return res.json();
};

export const getPublicDepartments = async () => {
  const res = await fetch(`${BASE}/public/departments`);
  return res.json();
};

export const getCollegeInfo = async () => {
  const res = await fetch(`${BASE}/college-info`);
  return res.json();
};

// Admin college info
export const updateCollegeInfo = (data) =>
  api.patch("/college-info", data).then((r) => r.data);

// Admin announcement services (authenticated)
export const getAdminAnnouncements = () =>
  api.get("/announcements").then((r) => r.data);

export const createAnnouncement = (formData) =>
  api.post("/announcements", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const updateAnnouncement = (id, formData) =>
  api.patch(`/announcements/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }).then((r) => r.data);

export const deleteAnnouncement = (id) =>
  api.delete(`/announcements/${id}`).then((r) => r.data);
