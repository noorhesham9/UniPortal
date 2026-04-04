import api from "./api";

export const getAllReceipts = (params) => api.get("/receipts", { params }).then(r => r.data);
export const approveReceipt = (studentId, academicYear) => api.patch(`/receipts/${studentId}/approve`, { academicYear }).then(r => r.data);
export const rejectReceipt = (studentId, reason, academicYear) => api.patch(`/receipts/${studentId}/reject`, { reason, academicYear }).then(r => r.data);
export const deleteReceipt = (studentId, academicYear) => api.delete(`/receipts/${studentId}`, { params: { academicYear } }).then(r => r.data);
