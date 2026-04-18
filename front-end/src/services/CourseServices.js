import api from "./api";

export const createCourse = async (courseData) => {
  const res = await api.post("/courses", courseData);
  return res.data;
};

export const getAllCourses = async (page = 1, limit = 10, search = "", filters = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append("search", search);
  if (filters.department_id) params.append("department_id", filters.department_id);
  if (filters.academic_year) params.append("academic_year", filters.academic_year);
  if (filters.semester_num) params.append("semester_num", filters.semester_num);
  const res = await api.get(`/courses?${params}`);
  return res.data;
};

export const getOfferedCourses = async (semesterId, search = "", department_id = "") => {
  const params = new URLSearchParams({ semesterId });
  if (search) params.append("search", search);
  if (department_id) params.append("department_id", department_id);
  const res = await api.get(`/courses/offered?${params}`);
  return res.data;
};

export const getCourseById = async (id) => {
  const res = await api.get(`/courses/${id}`);
  return res.data;
};

export const updateCourse = async (id, data) => {
  const res = await api.patch(`/courses/${id}`, data);
  return res.data;
};

export const toggleCourseActive = async (id) => {
  const res = await api.patch(`/courses/${id}/toggle-active`);
  return res.data;
};

export const offerCourse = async (id, data) => {
  const res = await api.post(`/courses/${id}/offer`, data);
  return res.data;
};

export const getAvailableCourses = async () => {
  const res = await api.get("/courses/available");
  return res.data;
};

// kept for backward compat — delegates to AdminServices
export { getDepartments } from "./AdminServices";

export const getMyEnrollments = async (semesterId = null) => {
  const url = semesterId ? `/enrollment/my?semesterId=${semesterId}` : "/enrollment/my";
  const res = await api.get(url);
  return res.data;
};

export const enrollInSection = async (sectionId) => {
  const res = await api.post("/enrollment/", { section: sectionId });
  return res.data;
};

export const dropEnrollment = async (enrollmentId) => {
  const res = await api.delete(`/enrollment/${enrollmentId}`);
  return res.data;
};

// kept for backward compat
export { getSections } from "./SectionServices";

// Admin direct enrollment — bypasses all eligibility checks
export const adminEnrollStudent = async (studentId, sectionId) => {
  const res = await api.post("/enrollment/admin-enroll", { studentId, sectionId });
  return res.data;
};

// Site lock
export const getSiteLock = async () => {
  const res = await api.get("/admin/site-lock");
  return res.data;
};

export const setSiteLock = async (locked) => {
  const res = await api.post("/admin/site-lock", { locked });
  return res.data;
};

// Active registration slice (public — for student info)
export const getActiveSlice = async () => {
  const res = await api.get("/registration-slices/active");
  return res.data;
};

// Check if the current student is eligible for the active registration slice
export const getMyEligibility = async () => {
  const res = await api.get("/registration-slices/my-eligibility");
  return res.data;
};
