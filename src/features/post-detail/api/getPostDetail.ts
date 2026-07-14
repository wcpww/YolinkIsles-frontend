import axiosInstance from '@/api/axiosInstance';
import { type PostDetailData, type PostDetailRequest } from '../types';

export const getPostDetail = async (postId: string): Promise<PostDetailData> => {
  const response = await axiosInstance.get<PostDetailRequest>(`/post/${postId}`);
  return response.data.data.post;
};
