import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createComment } from '../api/createComment';

export const useCreateComment = (postId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['post-comments', postId] });
    },
  });
};
