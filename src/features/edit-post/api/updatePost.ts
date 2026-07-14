import axiosInstance from '@/api/axiosInstance';

interface UpdatePostResponse {
  code: number;
  message: string;
}

export async function updatePost(
  postId: string,
  data: Record<string, unknown>,
): Promise<UpdatePostResponse> {
  const response = await axiosInstance.put<UpdatePostResponse>(`/post/${postId}`, { data });
  return response.data;
}
