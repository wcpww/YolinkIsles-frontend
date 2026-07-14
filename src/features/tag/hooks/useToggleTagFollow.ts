import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleTagFollow } from '../api/toggleTagFollow';
import type { Tag } from '../types';

export const useToggleTagFollow = (tagId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => toggleTagFollow(tagId),
    onSuccess: (data) => {
      queryClient.setQueryData<Tag>(['tag-detail', tagId], (old) => {
        if (!old) return old;
        return {
          ...old,
          isFollowing: data.isFollowing,
          numTagFollowers: data.numTagFollowers,
        };
      });
    },
  });
};