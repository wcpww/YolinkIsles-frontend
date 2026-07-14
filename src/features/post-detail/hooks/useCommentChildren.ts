import { useQuery } from '@tanstack/react-query';
import { getCommentChildren } from '../api/getCommentChildren';
import type { Comment } from '../types';

export const useCommentChildren = (
  parentId: string,
  postId: string,
  layer: number = 3,
  enabled: boolean = false,
) => {
  return useQuery<Comment[]>({
    queryKey: ['comment-children', parentId, postId],
    queryFn: () => getCommentChildren(parentId, postId, layer),
    enabled,
  });
};
