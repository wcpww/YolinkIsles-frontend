import axiosInstance from '@/api/axiosInstance';
import type { PostResult } from '../types';

interface SearchPostsResponse {
  data: {
    posts: PostResult[];
  };
}

export async function searchPosts(keyword: string, type: string = 'relevance') {
  const response = await axiosInstance.get<SearchPostsResponse>('/search/posts', {
    params: { keyword, type },
  });
  return response.data.data.posts;
}
