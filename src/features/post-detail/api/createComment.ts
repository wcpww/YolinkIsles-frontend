import axiosInstance from '@/api/axiosInstance';

interface CreateCommentParams {
  postId: string;
  rootId: string;
  userId: string;
  content: string;
}

interface CreateCommentResponse {
  code: number;
  message: string;
}

export const createComment = async (
  params: CreateCommentParams,
): Promise<CreateCommentResponse> => {
  const response = await axiosInstance.post<CreateCommentResponse>('/create-comment', params);
  return response.data;
};
