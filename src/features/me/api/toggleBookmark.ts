import axiosInstance from '@/api/axiosInstance';

interface ToggleBookmarkResponse {
  code: number;
  message: string;
  data: {
    isBookmarked: boolean;
  };
}

export const toggleBookmark = async (postId: string): Promise<{ isBookmarked: boolean }> => {
  const response = await axiosInstance.post<ToggleBookmarkResponse>(`/posts/${postId}/bookmark`);
  return response.data.data;
};
