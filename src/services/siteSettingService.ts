import api from '@/lib/api';

export const uploadSiteBanner = async (formData: FormData) => {
  const response = await api.post('/api/v1/admin/banner/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getSiteBanner = async () => {
  const response = await api.get('/api/v1/banner');
  return response.data;
};

// Gallery APIs
export const uploadGalleryImage = async (formData: FormData) => {
  const response = await api.post('/api/v1/admin/gallery/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getGalleryImages = async () => {
  const response = await api.get('/api/v1/gallery');
  return response.data;
};
