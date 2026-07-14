import axiosInstance from '@/api/axiosInstance';

export async function updateContact(data: { email?: string; phone?: string }) {
  const response = await axiosInstance.post('/me/contact', data);
  return response.data;
}
