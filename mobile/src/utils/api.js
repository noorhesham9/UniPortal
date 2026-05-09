import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { auth } from "./firebaseConfig";

import { Platform } from "react-native";

const API_URL = "https://uni-portal-blue.vercel.app/api/v1";
const TOKEN_KEY = "@firebase_token";

// Call this after login to persist the token
export const saveToken = async (token) => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = async () => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// Add Firebase token to requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      await auth.authStateReady();

      let token = null;

      if (auth.currentUser) {
        // Firebase has session — get fresh token
        token = await auth.currentUser.getIdToken();
        // Keep stored token in sync
        await AsyncStorage.setItem(TOKEN_KEY, token);
      } else {
        // Firebase has no session (Expo Go) — use stored token
        token = await AsyncStorage.getItem(TOKEN_KEY);
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(
      `[API] ✗ ${error.response?.status} ${error.config?.url} —`,
      error.response?.data?.message || error.message,
      error.code,
    );
    return Promise.reject(error);
  },
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
  getEmailByStudentId: (studentId) =>
    apiClient.get(`/auth/student-email/${studentId}`),
};

// Public endpoints (no auth needed)
export const publicAPI = {
  getAnnouncements: () => apiClient.get("/announcements/public"),
  getSiteLock: () => apiClient.get("/admin/site-lock"),
  getActiveSemester: () => apiClient.get("/semesters/active/current"),
};

// Course endpoints
export const courseAPI = {
  getAvailableCourses: () => apiClient.get("/courses/available"),
  getCourseById: (id) => apiClient.get(`/courses/${id}`),
  updateCourse: (id, courseData) => apiClient.put(`/courses/${id}`, courseData),
};

// Enrollment endpoints
export const enrollmentAPI = {
  createEnrollment: (enrollmentData) =>
    apiClient.post("/enrollment", enrollmentData),
  getCompletedHours: (studentId) =>
    apiClient.get(`/enrollment/${studentId}/completed-hours`),
  joinWaitlist: (enrollmentData) =>
    apiClient.post("/enrollment/waitlist/join", enrollmentData),
  getAcademicRecords: (studentId) =>
    apiClient.get(`/enrollment/${studentId}/academic-records`),
  getCurrentSemesterGrades: (studentId) =>
    apiClient.get(`/enrollment/${studentId}/current-semester-grades`),
  getMyEnrollments: (semesterId) =>
    apiClient.get(
      `/enrollment/my${semesterId ? `?semesterId=${semesterId}` : ""}`,
    ),
  dropEnrollment: (enrollmentId) =>
    apiClient.delete(`/enrollment/${enrollmentId}`),
};

// Grades endpoints
export const gradesAPI = {
  getMyGrades: () => apiClient.get("/grades/my"),
  getMySummary: () => apiClient.get("/grades/my-summary"),
  getFinalResults: () => apiClient.get("/grades/results"),
  getAcademicRecord: (studentId) =>
    apiClient.get(`/grades/academic-record/${studentId}`),
};

export default apiClient;
