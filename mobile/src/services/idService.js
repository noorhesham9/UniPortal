import api from '../utils/api';

export const getAcceptedIDs = async () => {
  try {
    const response = await api.get('/admin/allowed_students');
    return {
      data: response.data.items || [],
      total: response.data.total || 0,
      newThisWeek: 0,
    };
  } catch (error) {
    console.error("Error fetching IDs:", error);
    throw error;
  }
};

export const addAllowedStudent = async (studentId, email) => {
  const response = await api.post('/admin/allow_Student', { studentId, email });
  return response.data;
};