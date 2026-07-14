import axiosInstance from '@/api/axiosInstance';
import type { User } from '../types/User';

interface UserProfileResponse {
  data: {
    user: User;
  };
}

export const getMe = async (): Promise<User> => {
  const response = await axiosInstance.get<UserProfileResponse>('/me');
  return response.data.data.user;
};

export const getUser = async (userId: string): Promise<User> => {
  const response = await axiosInstance.get<UserProfileResponse>(`/user/${userId}`);
  return response.data.data.user;
};
