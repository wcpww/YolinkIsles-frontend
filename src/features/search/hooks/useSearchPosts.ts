import { useQuery } from '@tanstack/react-query';
import { searchPosts } from '../api';
import type { PostResult } from '../types';

export const useSearchPosts = (
  keyword: string,
  type: string = 'relevance',
  enabled: boolean = true,
) => {
  return useQuery<PostResult[]>({
    queryKey: ['search-posts', keyword, type],
    queryFn: () => searchPosts(keyword, type),
    enabled: enabled && keyword.length > 0,
  });
};
