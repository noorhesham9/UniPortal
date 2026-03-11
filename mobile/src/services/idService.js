import api from '../utils/api';

export const getAcceptedIDs = async () => {
  try {
    const response = await api.get('/admin/accepted-ids');

    return {
      data: response.data.data,
      total: response.data.total,
      newThisWeek: response.data.newThisWeek
    };

  } catch (error) {
    console.error("Error fetching IDs:", error);
    throw error;
  }
};