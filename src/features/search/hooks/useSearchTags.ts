import { useQuery } from '@tanstack/react-query';
import { searchTags } from '../api';
import type { Tag } from '../types';

export const useSearchTags = (
  keyword: string,
  type: string = 'relevance',
  enabled: boolean = true,
) => {
  return useQuery<Tag[]>({
    queryKey: ['search-tags', keyword, type],
    queryFn: () => searchTags(keyword, type),
    enabled: enabled && keyword.length > 0,
  });
};
