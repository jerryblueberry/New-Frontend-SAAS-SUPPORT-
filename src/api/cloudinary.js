import api from './axios';

export const deleteCloudinaryImage = async (publicId) => {
  return api.post('/onboarding/delete-cloudinary', { publicId });
}; 