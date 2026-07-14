import axiosInstance from '@/api/axiosInstance';

interface ToggleTagFollowResponse {
  code: number;
  message: string;
  data: {
    isFollowing: boolean;
    numTagFollowers: number;
  };
}

export const toggleTagFollow = async (
  tagId: string,
): Promise<{ isFollowing: boolean; numTagFollowers: number }> => {
  const response = await axiosInstance.post<ToggleTagFollowResponse>(`/tag/${tagId}/follow`);
  return response.data.data;
};