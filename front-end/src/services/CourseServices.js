import axios from "axios";

const API_BASE_URL = "http://localhost:3100/api/v1";

const withCreds = { withCredentials: true };

// إنشاء كورس جديد
export const createCourse = async (courseData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/courses`, courseData, withCreds);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// جلب جميع الأقسام
export const getDepartments = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/departments`, withCreds);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// جلب جميع الكورسات (للمتطلبات السابقة)
export const getAllCourses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/courses`, withCreds);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// جلب الكورسات المتاحة للتسجيل (للطالب حسب القسم والمستوى والترم النشط)
export const getAvailableCourses = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/courses/available`, withCreds);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// جلب سكشنز الترم (اختياري: حسب الكورس)
export const getSections = async (semesterId, courseId = null) => {
  try {
    const params = new URLSearchParams({ semesterId });
    if (courseId) params.append("courseId", courseId);
    const response = await axios.get(`${API_BASE_URL}/sections?${params}`, withCreds);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// جلب تسجيلاتي الحالية
export const getMyEnrollments = async (semesterId = null) => {
  try {
    const url = semesterId
      ? `${API_BASE_URL}/enrollment/my?semesterId=${semesterId}`
      : `${API_BASE_URL}/enrollment/my`;
    const response = await axios.get(url, withCreds);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// التسجيل في سكشن
export const enrollInSection = async (sectionId) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/enrollment/enroll`,
      { section: sectionId },
      withCreds
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// حذف التسجيل (drop)
export const dropEnrollment = async (enrollmentId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/enrollment/${enrollmentId}`,
      withCreds
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
