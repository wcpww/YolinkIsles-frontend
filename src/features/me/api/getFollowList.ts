import axiosInstance from '@/api/axiosInstance';
import type { FollowUser } from '../types';

interface FollowListResponse {
  code: number;
  message: string;
  data: FollowUser[];
}

export const getFollowers = async (): Promise<FollowUser[]> => {
  const response = await axiosInstance.get<FollowListResponse>('/me/followers');
  return response.data.data;
};

export const getFollowing = async (): Promise<FollowUser[]> => {
  const response = await axiosInstance.get<FollowListResponse>('/me/following');
  return response.data.data;
};
