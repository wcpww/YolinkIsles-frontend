import { useQuery } from '@tanstack/react-query';
import { getPostComments } from '../api/getPostComments';
import type { Comment } from '../types';

export const usePostComments = (postId: string, maxDepth: number = 3, enabled: boolean = true) => {
  return useQuery<Comment[]>({
    queryKey: ['post-comments', postId],
    queryFn: () => getPostComments(postId, maxDepth),
    enabled,
  });
};
