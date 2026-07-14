import axiosInstance from '@/api/axiosInstance';
import { type Tag } from '../types';

export interface PopularTagsResponse {
  code: number;
  message: string;
  data: {
    tags: Tag[];
  };
}

export const getTags = async (): Promise<Tag[]> => {
  const params = {
    limit: 10, // 获取前10条热门标签
  };
  const response = await axiosInstance.get<PopularTagsResponse>('/tag/trends', { params });
  const tags = response.data.data.tags;

  // 确保返回的总是数组
  return Array.isArray(tags) ? tags : [tags];
};
