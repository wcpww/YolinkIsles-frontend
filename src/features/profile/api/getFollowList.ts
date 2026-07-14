import axiosInstance from '@/api/axiosInstance';
import type { FollowUser } from '@/features/me/types';

interface FollowListResponse {
  code: number;
  message: string;
  data: FollowUser[];
}

export const getFollowers = async (profileId: string): Promise<FollowUser[]> => {
  const response = await axiosInstance.get<FollowListResponse>(`/user/${profileId}/followers`);
  return response.data.data;
};

export const getFollowing = async (profileId: string): Promise<FollowUser[]> => {
  const response = await axiosInstance.get<FollowListResponse>(`/user/${profileId}/following`);
  return response.data.data;
};
