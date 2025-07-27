import api from './axios';

export const fetchUserUpcomingHolidays = async () => {
  const response = await api.get('/upcoming-holidays/my');
  return response.data;
};

export const createUserUpcomingHoliday = async (holidayData) => {
  const response = await api.post('/upcoming-holidays/create', holidayData);
  return response.data;
};

export const deleteUserUpcomingHoliday = async (id) => {
  const response = await api.delete(`/upcoming-holidays/delete/${id}`);
  return response.data;
};

export const updateUserUpcomingHoliday = async (id, data) => {
  const response = await api.put(`/upcoming-holidays/update/${id}`, data);
  return response.data;
};