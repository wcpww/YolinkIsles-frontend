import { getPostDetail } from '@/features/post-detail/api/getPostDetail';
import type { PostDetailData } from '@/features/post-detail/types';

export const getPostForEdit = async (postId: string): Promise<PostDetailData> => {
  return getPostDetail(postId);
};
