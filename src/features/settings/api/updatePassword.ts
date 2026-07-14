import axiosInstance from '@/api/axiosInstance';

export async function updatePassword(data: { currentPassword: string; newPassword: string }) {
  const response = await axiosInstance.post('/me/password', data);
  return response.data;
}
