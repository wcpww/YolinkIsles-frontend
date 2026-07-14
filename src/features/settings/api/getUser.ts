import axiosInstance from '@/api/axiosInstance';
import type { User } from '../types/User';

interface UserProfileResponse {
  data: {
    user: User;
  };
}

export const getUser = async (): Promise<User> => {
  const response = await axiosInstance.get<UserProfileResponse>('/me');
  return response.data.data.user;
};
