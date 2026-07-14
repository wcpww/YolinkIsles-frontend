import { useQuery } from '@tanstack/react-query';
import { getUser } from '../api/getUser';

export const useAuthorInfo = (authorId: string) => {
  return useQuery({
    queryKey: ['author', authorId],
    queryFn: () => getUser(authorId),
  });
};
