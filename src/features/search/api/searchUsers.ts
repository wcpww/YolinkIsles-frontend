import axiosInstance from '@/api/axiosInstance';
import type { UserResult } from '../types/UserResult';

interface SearchUsersResponse {
  data: {
    users: UserResult[];
  };
}

export async function searchUsers(keyword: string, type: string = 'relevance') {
  const response = await axiosInstance.get<SearchUsersResponse>('/search/users', {
    params: { keyword, type },
  });
  return response.data.data.users;
}
