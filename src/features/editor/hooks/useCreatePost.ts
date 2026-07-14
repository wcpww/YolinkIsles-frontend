import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { createPost } from '../api/createPost';
import type { CreatePostRequest } from '../types';

/**
 * 创建文章的 mutation hook
 * 处理文章发布流程：发送请求 → 清理草稿 → 显示提示 → 导航回主页
 *
 * @returns 返回 useMutation 对象，包含 mutate/mutateAsync、isPending、isSuccess、error 等
 *
 * @example
 * ```typescript
 * const createPostMutation = useCreatePost();
 *
 * const handlePublish = async (postData: CreatePostRequest) => {
 *   await createPostMutation.mutateAsync(postData);
 * };
 * ```
 */
export const useCreatePost = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => createPost(data),
    onSuccess: () => {
      // 清除草稿
      const draftId = localStorage.getItem('current_draft_id');
      if (draftId) {
        localStorage.removeItem(`draft_${draftId}`);
        localStorage.removeItem('current_draft_id');
      }

      // TODO: 显示成功提示 (Toast/Notification)
      console.log('文章发布成功！');

      // 导航回主页
      navigate({ to: '/' });
    },
    onError: (error) => {
      // TODO: 显示错误提示
      console.error('发布失败:', error);
    },
  });
};
