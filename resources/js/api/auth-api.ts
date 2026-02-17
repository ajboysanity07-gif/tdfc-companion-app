import axiosClient, { getCsrfCookie, setAuthToken } from './axios-client';

export async function register(formData: FormData) {
  await getCsrfCookie();
  return axiosClient.post('/register', formData);
}

export async function login(payload: { login: string; password: string; remember?: boolean }) {
  await getCsrfCookie();
  const res = await axiosClient.post('/login', payload);
  const token = res?.data?.token;
  if (token) {
    setAuthToken(token);
  }
  return res;
}

export const getUser = () => axiosClient.get('/user');
export const logout = async () => {
  await axiosClient.post('/logout');
  setAuthToken(null);
};

// Admin dashboard APIs
export const getAdminSummary = () => axiosClient.get('/admin/dashboard/summary');
export const getAdminRecentUsers = () => axiosClient.get('/admin/dashboard/recent-users');
