import { useQuery } from '@tanstack/react-query';
import { searchUsers } from '../api';
import type { UserResult } from '../types/UserResult';

export const useSearchUsers = (
  keyword: string,
  type: string = 'relevance',
  enabled: boolean = true,
) => {
  return useQuery<UserResult[]>({
    queryKey: ['search-users', keyword, type],
    queryFn: () => searchUsers(keyword, type),
    enabled: enabled && keyword.length > 0,
  });
};
