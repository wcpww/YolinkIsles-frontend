import axiosInstance from '@/api/axiosInstance';

interface ToggleLikeResponse {
  code: number;
  message: string;
  data: {
    isLiked: boolean;
    likes: number;
  };
}

export const toggleLike = async (postId: string): Promise<{ isLiked: boolean; likes: number }> => {
  const response = await axiosInstance.post<ToggleLikeResponse>(`/posts/${postId}/like`);
  return response.data.data;
};
