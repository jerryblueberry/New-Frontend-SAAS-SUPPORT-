import api from './axios';

export const fetchUpcomingHolidays = async () => {
  const response = await api.get('/upcoming-holidays/get-all');
  return response.data;
}; 