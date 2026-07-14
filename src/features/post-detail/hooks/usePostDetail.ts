import { useQuery } from '@tanstack/react-query';
import { getPostDetail } from '../api/getPostDetail';
import type { PostDetailData } from '../types';

export const usePostDetail = (postId: string) => {
  return useQuery<PostDetailData>({
    queryKey: ['post', postId],
    queryFn: () => getPostDetail(postId),
  });
};
