import { useQuery } from '@tanstack/react-query';
import { getFollowers, getFollowing } from '../api/getFollowList';

export const useFollowers = () => {
  return useQuery({
    queryKey: ['me-followers'],
    queryFn: () => getFollowers(),
  });
};

export const useFollowing = () => {
  return useQuery({
    queryKey: ['me-following'],
    queryFn: () => getFollowing(),
  });
};
