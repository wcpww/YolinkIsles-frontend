import { useQuery } from '@tanstack/react-query';
import { getTagPosts } from '../api/getTagPosts';

export const useTagPosts = (tagId: string) => {
  return useQuery({
    queryKey: ['tag-posts', tagId],
    queryFn: () => getTagPosts(tagId),
  });
};
