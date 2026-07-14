import axiosInstance from '@/api/axiosInstance';

export async function updateAuthInfo(data: { realName?: string; studentId?: string }) {
  const response = await axiosInstance.post('/me/auth_info', data);
  return response.data;
}
