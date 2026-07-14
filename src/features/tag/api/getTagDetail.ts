import axiosInstance from '@/api/axiosInstance';
import type { Tag } from '../types';

interface TagDetailResponse {
  code: number;
  message: string;
  data: Tag;
}

export const getTagDetail = async (tagId: string): Promise<Tag> => {
  const response = await axiosInstance.get<TagDetailResponse>(`/tag/${tagId}`);

  console.log(response.data.data);
  return response.data.data;
};
