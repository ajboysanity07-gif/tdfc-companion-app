import axiosClient, { getCsrfCookie } from './axios-client';

export async function register(formData: FormData) {
  await getCsrfCookie();
  return axiosClient.post('/register', formData);
}

export async function login(payload: { email: string; password: string }) {
  await getCsrfCookie();
  return axiosClient.post('/login', payload);
}

export const getUser = () => axiosClient.get('/user');
export const logout = () => axiosClient.post('/logout');

// Admin dashboard APIs
export const getAdminSummary = () => axiosClient.get('/admin/dashboard/summary');
export const getAdminRecentUsers = () => axiosClient.get('/admin/dashboard/recent-users');
