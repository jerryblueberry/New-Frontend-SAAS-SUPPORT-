import api from './axios';

export const deleteCloudinaryImage = async (publicId) => {
  return api.post('/onboarding/delete-cloudinary', { publicId });
};

// Get all Cloudinary documents with worker mapping and usage status
export const getAllCloudinaryDocuments = async () => {
  return api.get('/admin/cloudinary/documents');
};

// Cleanup orphaned Cloudinary documents
export const cleanupCloudinaryOrphans = async (folder = 'aecus-care/certifications', dryRun = false) => {
  return api.post('/cron/cleanup-cloudinary', { folder, dryRun });
}; 