import { useQuery } from '@tanstack/react-query';
import { getBookmarkedPosts } from '../api/getBookmarkedPosts';

export const useBookmarkedPosts = () => {
  return useQuery({
    queryKey: ['me-bookmarked-posts'],
    queryFn: () => getBookmarkedPosts(),
    staleTime: 0,
  });
};
