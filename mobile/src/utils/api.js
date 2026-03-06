import axios from 'axios';
import { auth } from './firebaseConfig';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

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
      console.error('Error getting Firebase token:', error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth endpoints
export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (email, password) => 
    apiClient.post('/auth/login', { email, password }),
  getMe: () => apiClient.get('/auth/me'),
  logout: () => apiClient.get('/auth/logout'),
};

// Course endpoints
export const courseAPI = {
  getAvailableCourses: () => apiClient.get('/courses/available'),
};

// Enrollment endpoints
export const enrollmentAPI = {
  createEnrollment: (enrollmentData) =>
    apiClient.post('/enrollments', enrollmentData),
  getCompletedHours: (studentId) =>
    apiClient.get(`/enrollments/${studentId}/completed-hours`),
  joinWaitlist: (enrollmentData) =>
    apiClient.post('/enrollments/waitlist/join', enrollmentData),
};

export default apiClient;
