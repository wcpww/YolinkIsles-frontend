import { useQuery } from '@tanstack/react-query';
import { getUser } from '../api/getUser';

export const useProfile = (userId: string) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => getUser(userId),
  });
};
