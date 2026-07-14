import axiosInstance from '@/api/axiosInstance';

interface ToggleCommentLikeResponse {
  code: number;
  message: string;
  data: {
    isLiked: boolean;
    likes: number;
  };
}

export const toggleCommentLike = async (
  commentId: string,
): Promise<{ isLiked: boolean; likes: number }> => {
  const response = await axiosInstance.post<ToggleCommentLikeResponse>(
    `/comment/${commentId}/like`,
  );
  return response.data.data;
};
