import axios from "axios";
import { auth } from "./firebaseConfig";

// const API_URL = "http://10.0.2.2:3100/api/v1";
const API_URL = "http://localhost:3100/api/v1";

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add Firebase token to requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      if (auth.currentUser) {
        const token = await auth.currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting Firebase token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Auth endpoints
export const authAPI = {
  register: (userData) =>
    apiClient.post("/auth/register", {
      idToken: userData.idToken,
      studentId: userData.StudentID,
      name: userData.name,
      email: userData.email,
    }),
  login: (email, password) =>
    apiClient.post("/auth/login", { email, password }),
  getMe: () => apiClient.get("/auth/me"),
  logout: () => apiClient.get("/auth/logout"),
};

// Course endpoints
export const courseAPI = {
  getAvailableCourses: () => apiClient.get("/courses/available"),
};

// Enrollment endpoints
export const enrollmentAPI = {
  createEnrollment: (enrollmentData) =>
    apiClient.post("/enrollments", enrollmentData),
  getCompletedHours: (studentId) =>
    apiClient.get(`/enrollments/${studentId}/completed-hours`),
  joinWaitlist: (enrollmentData) =>
    apiClient.post("/enrollments/waitlist/join", enrollmentData),
  getAcademicRecords: (studentId) =>
    apiClient.get(`/enrollments/${studentId}/academic-records`),
  getCurrentSemesterGrades: (studentId) =>
    apiClient.get(`/enrollments/${studentId}/current-semester-grades`),
};

export default apiClient;
