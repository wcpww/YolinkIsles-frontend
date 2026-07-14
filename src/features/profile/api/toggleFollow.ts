/**
 * 建议 API 设计：
 * POST /user/{userId}/follow
 * Response: { code: number, message: string, data: { isFollowing: boolean } }
 * 若已关注则取消，未关注则添加（toggle）
 */

import axiosInstance from '@/api/axiosInstance';

interface ToggleFollowResponse {
  code: number;
  message: string;
  data: {
    isFollowing: boolean;
    numFollowers: number;
  };
}

export const toggleFollow = async (
  userId: string,
): Promise<{ isFollowing: boolean; numFollowers: number }> => {
  const response = await axiosInstance.post<ToggleFollowResponse>(`/user/${userId}/follow`);
  return response.data.data;
};
