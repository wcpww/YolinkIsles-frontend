import axiosInstance from '@/api/axiosInstance';
import type { Tag } from '../types';

interface SearchTagsResponse {
  data: {
    tags: Tag[];
  };
}

export async function searchTags(keyword: string, type: string = 'numPosts') {
  const response = await axiosInstance.get<SearchTagsResponse>('/search/tags', {
    params: { keyword, type },
  });
  return response.data.data.tags;
}
