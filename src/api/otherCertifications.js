import api from './axios';

// Delete an 'Other Certification' by its _id
export const deleteOtherCertification = (id) => {
  return api.delete(`/other-certifications/${id}`);
};