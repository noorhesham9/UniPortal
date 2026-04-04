import api from "./api";

export const getConversation  = (userId) => api.get(`/chat/${userId}`).then(r => r.data);
export const sendMessage      = (receiverId, text) => api.post("/chat/send", { receiverId, text }).then(r => r.data);
export const sendFile         = (receiverId, file) => {
  const fd = new FormData();
  fd.append("receiverId", receiverId);
  fd.append("file", file);
  return api.post("/chat/send-file", fd, { headers: { "Content-Type": "multipart/form-data" } }).then(r => r.data);
};
export const getMyAdvisor    = () => api.get("/chat/advisor").then(r => r.data);
export const getMyStudents   = () => api.get("/chat/students").then(r => r.data);
export const getUnreadCounts = () => api.get("/chat/unread").then(r => r.data);
