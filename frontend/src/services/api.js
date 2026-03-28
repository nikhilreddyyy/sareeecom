import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('auth-storage');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth-storage');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Products
export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getFilters: () => api.get('/products/filters'),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  addReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

// Categories
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getOne: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Orders
export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  pay: (id, data) => api.put(`/orders/${id}/pay`, data),
  adminGetAll: (params) => api.get('/orders/admin/all', { params }),
  adminUpdateStatus: (id, data) => api.put(`/orders/admin/${id}/status`, data),
  getAnalytics: () => api.get('/orders/admin/analytics'),
};

// Coupons
export const couponAPI = {
  getAll: () => api.get('/coupons'),
  create: (data) => api.post('/coupons', data),
  update: (id, data) => api.put(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
  validate: (code) => api.post('/coupons/validate', { code }),
};

// Banners
export const bannerAPI = {
  getAll: (params) => api.get('/banners', { params }),
  adminGetAll: () => api.get('/banners/admin/all'),
  create: (data) => api.post('/banners', data),
  update: (id, data) => api.put(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
};

// Users (admin)
export const userAPI = {
  getAll: (params) => api.get('/admin/users', { params }),
  getOne: (id) => api.get(`/admin/users/${id}`),
  toggleBlock: (id) => api.put(`/admin/users/${id}/toggle-block`),
};

// Upload
export const uploadAPI = {
  images: (formData) => api.post('/upload/images', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  video: (formData) => api.post('/upload/video', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (publicId, resourceType) => api.delete('/upload', { data: { publicId, resourceType } }),
};
