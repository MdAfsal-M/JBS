import axios, { AxiosInstance, AxiosResponse } from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://jbs-9rfs.onrender.com/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// API Helper function
export const apiCall = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any,
  config?: any
): Promise<T> => {
  try {
    const response = await api.request({
      method,
      url: endpoint,
      data,
      ...config,
    });
    return response.data;
  } catch (error: any) {
    // Enhanced error handling to preserve response details
    if (error.response) {
      // Server responded with error status
      const errorWithResponse = new Error(error.response.data?.message || error.message);
      (errorWithResponse as any).response = error.response;
      throw errorWithResponse;
    } else if (error.request) {
      // Request made but no response
      const errorWithRequest = new Error('No response from server');
      (errorWithRequest as any).request = error.request;
      throw errorWithRequest;
    } else {
      // Other errors
      throw error;
    }
  }
};

// Authentication API
export const authAPI = {
  login: (credentials: { email: string; password: string; userType?: string }) =>
    apiCall('POST', '/auth/login', credentials),
  
  register: (userData: any) =>
    apiCall('POST', '/auth/register', userData),
  
  ownerRegister: (ownerData: any) =>
    apiCall('POST', '/auth/owner/register', ownerData),
  
  studentRegister: (studentData: any) =>
    apiCall('POST', '/auth/student/register', studentData),
  
  forgotPassword: (email: string) =>
    apiCall('POST', '/auth/forgot-password', { email }),
  
  resetPassword: (token: string, password: string) =>
    apiCall('POST', '/auth/reset-password', { token, password }),
  
  changePassword: (currentPassword: string, newPassword: string) =>
    apiCall('POST', '/auth/change-password', { currentPassword, newPassword }),
  
  getProfile: () => apiCall('GET', '/auth/me'),
  
  refreshToken: () => apiCall('POST', '/auth/refresh'),
  
  logout: () => apiCall('POST', '/auth/logout'),
};

// Dashboard API
export const dashboardAPI = {
  getOwnerDashboard: () => apiCall('GET', '/owner/dashboard'),
  getOwnerAnalytics: () => apiCall('GET', '/owner/analytics'),
  getOwnerQuickStats: () => apiCall('GET', '/owner/quick-stats'),
  getOwnerNotifications: (params?: any) => apiCall('GET', '/owner/notifications', undefined, { params }),
  updateNotification: (id: string, data: any) =>
    apiCall('PUT', `/owner/notifications/${id}`, data),
  markNotificationAsRead: (id: string) => apiCall('PUT', `/owner/notifications/${id}/read`),
  markAllNotificationsAsRead: () => apiCall('PUT', '/owner/notifications/read-all'),
  deleteNotification: (id: string) => apiCall('DELETE', `/owner/notifications/${id}`),
};

// Jobs API
export const jobsAPI = {
  getAll: (params?: any) => apiCall('GET', '/jobs', undefined, { params }),
  getById: (id: string) => apiCall('GET', `/jobs/${id}`),
  create: (data: any) => apiCall('POST', '/jobs', data),
  update: (id: string, data: any) => apiCall('PUT', `/jobs/${id}`, data),
  delete: (id: string) => apiCall('DELETE', `/jobs/${id}`),
  getStats: () => apiCall('GET', '/jobs/stats'),
};

// Internships API
export const internshipsAPI = {
  getAll: (params?: any) => apiCall('GET', '/internships', undefined, { params }),
  getById: (id: string) => apiCall('GET', `/internships/${id}`),
  create: (data: any) => apiCall('POST', '/internships', data),
  update: (id: string, data: any) => apiCall('PUT', `/internships/${id}`, data),
  delete: (id: string) => apiCall('DELETE', `/internships/${id}`),
  getStats: () => apiCall('GET', '/internships/stats'),
};

// Products API
export const productsAPI = {
  getAll: (params?: any) => apiCall('GET', '/products', undefined, { params }),
  getById: (id: string) => apiCall('GET', `/products/${id}`),
  create: (data: any) => apiCall('POST', '/products', data),
  update: (id: string, data: any) => apiCall('PUT', `/products/${id}`, data),
  delete: (id: string) => apiCall('DELETE', `/products/${id}`),
  getStats: () => apiCall('GET', '/products/stats'),
};

// Orders API
export const ordersAPI = {
  getAll: (params?: any) => apiCall('GET', '/orders', undefined, { params }),
  getById: (id: string) => apiCall('GET', `/orders/${id}`),
  create: (data: any) => apiCall('POST', '/orders', data),
  update: (id: string, data: any) => apiCall('PUT', `/orders/${id}`, data),
  delete: (id: string) => apiCall('DELETE', `/orders/${id}`),
  getStats: () => apiCall('GET', '/orders/stats'),
};

// File Upload API
export const uploadAPI = {
  uploadBusinessLicense: (file: File) => {
    const formData = new FormData();
    formData.append('businessLicense', file);
    return apiCall('POST', '/upload/business-license', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getFile: (filename: string) => apiCall('GET', `/upload/files/${filename}`),
  deleteFile: (filename: string) => apiCall('DELETE', `/upload/files/${filename}`),
};

// Student API
export const studentAPI = {
  getDashboard: () => apiCall('GET', '/student/dashboard'),
  getProfile: () => apiCall('GET', '/student/profile'),
  updateProfile: (data: any) => apiCall('PUT', '/student/profile', data),
  getApplications: () => apiCall('GET', '/student/applications'),
  applyForJob: (jobId: string, data: any) =>
    apiCall('POST', `/student/jobs/${jobId}/apply`, data),
  applyForInternship: (internshipId: string, data: any) =>
    apiCall('POST', `/student/internships/${internshipId}/apply`, data),
  getAvailableJobs: (params?: any) =>
    apiCall('GET', '/student/jobs', undefined, { params }),
  getAvailableInternships: (params?: any) =>
    apiCall('GET', '/student/internships', undefined, { params }),
};

// User Profile API
export const userAPI = {
  getProfile: () => apiCall('GET', '/users/profile'),
  
  updateProfile: (profileData: any) =>
    apiCall('PUT', '/users/profile', profileData),
  
  // Add other user-related endpoints as needed
};

// Owner Opportunities API
export const ownerOpportunitiesAPI = {
  create: (data: any) => apiCall('POST', '/owner-opportunities/opportunities', data),
  getAll: (params?: any) => apiCall('GET', '/owner-opportunities/opportunities', undefined, { params }),
  getById: (id: string) => apiCall('GET', `/owner-opportunities/opportunities/${id}`),
  update: (id: string, data: any) => apiCall('PUT', `/owner-opportunities/opportunities/${id}`, data),
  delete: (id: string) => apiCall('DELETE', `/owner-opportunities/opportunities/${id}`),
};

// Owner Applications API
export const ownerApplicationsAPI = {
  getApplications: (params?: any) => apiCall('GET', '/owner/applications', undefined, { params }),
  getApplicationById: (id: string) => apiCall('GET', `/owner/applications/${id}`),
  updateApplicationStatus: (id: string, data: any) => apiCall('PUT', `/owner/applications/${id}/status`, data),
  getApplicationStats: () => apiCall('GET', '/owner/applications/stats'),
};

// Student Opportunities API
export const studentOpportunitiesAPI = {
  getJobs: (params?: any) => apiCall('GET', '/student-opportunities/jobs', undefined, { params }),
  getInternships: (params?: any) => apiCall('GET', '/student-opportunities/internships', undefined, { params }),
  getById: (id: string) => apiCall('GET', `/student-opportunities/opportunities/${id}`),
  search: (params?: any) => apiCall('GET', '/student-opportunities/opportunities/search', undefined, { params }),
  apply: (opportunityType: string, id: string, data: any) => 
    apiCall('POST', `/student-opportunities/${opportunityType}/${id}/apply`, data),
};

// Student View API - For viewing jobs and internships
export const studentViewAPI = {
  getJobs: (params?: any) => apiCall('GET', '/student-view/jobs', undefined, { params }),
  getInternships: (params?: any) => apiCall('GET', '/student-view/internships', undefined, { params }),
  getJobById: (id: string) => apiCall('GET', `/student-view/jobs/${id}`),
  getInternshipById: (id: string) => apiCall('GET', `/student-view/internships/${id}`),
  getCategories: () => apiCall('GET', '/student-view/categories'),
  getLocations: () => apiCall('GET', '/student-view/locations'),
};

// Student Applications API
export const studentApplicationsAPI = {
  submitApplication: (opportunityId: string, data: any) =>
    apiCall('POST', `/student/apply/${opportunityId}`, data),
  getApplications: (params?: any) => apiCall('GET', '/student/applications', undefined, { params }),
  getApplicationById: (id: string) => apiCall('GET', `/student/applications/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params?: any) => apiCall('GET', '/notifications', undefined, { params }),
  getNotificationById: (id: string) => apiCall('GET', `/notifications/${id}`),
  markAsRead: (id: string) => apiCall('PUT', `/notifications/${id}/read`),
  markAllAsRead: () => apiCall('PUT', '/notifications/read-all'),
  deleteNotification: (id: string) => apiCall('DELETE', `/notifications/${id}`),
};

// Owner Jobs API
export const ownerJobsAPI = {
  getJobs: (params?: any) => apiCall('GET', '/owner-jobs/jobs', undefined, { params }),
  getInternships: (params?: any) => apiCall('GET', '/owner-jobs/internships', undefined, { params }),
  getJobById: (id: string) => apiCall('GET', `/owner-jobs/jobs/${id}`),
  getInternshipById: (id: string) => apiCall('GET', `/owner-jobs/internships/${id}`),
  getJobApplicants: (id: string) => apiCall('GET', `/owner-jobs/jobs/${id}/applicants`),
  getInternshipApplicants: (id: string) => apiCall('GET', `/owner-jobs/internships/${id}/applicants`),
};

export default api;
