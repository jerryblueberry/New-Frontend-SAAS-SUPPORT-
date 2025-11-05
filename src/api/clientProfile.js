import api from './axios';

export const getClientProfile = () => api.get('/client/profile');
export const upsertClientProfileStep = (step, payload) => api.put(`/client/profile/step/${step}`, payload);
