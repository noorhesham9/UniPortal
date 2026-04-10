import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { auth } from "./firebaseConfig";

const API_URL = "http://192.168.1.104:3100/api/v1";
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
  timeout: 10000,
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
        console.log(`[API] Token from Firebase: ${auth.currentUser.email}`);
      } else {
        // Firebase has no session (Expo Go) — use stored token
        token = await AsyncStorage.getItem(TOKEN_KEY);
        if (token) {
          console.log(`[API] Token from AsyncStorage`);
        } else {
          console.warn(`[API] No token available`);
        }
      }

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error getting token:", error);
    }
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`[API] ✓ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      `[API] ✗ ${error.response?.status} ${error.config?.url} —`,
      error.response?.data?.message || error.message,
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
