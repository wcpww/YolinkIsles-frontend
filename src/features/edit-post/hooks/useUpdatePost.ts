import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { updatePost } from '../api/updatePost';

export const useUpdatePost = (postId: string) => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => updatePost(postId, data),
    onSuccess: () => {
      navigate({ to: '/post/$postId', params: { postId } });
    },
    onError: () => {
      // error handled by caller
    },
  });
};
