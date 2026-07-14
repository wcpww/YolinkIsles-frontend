import { useQuery } from '@tanstack/react-query';
import { getFollowers, getFollowing } from '../api/getFollowList';

export const useFollowers = (profileId: string) => {
  return useQuery({
    queryKey: ['profile-followers', profileId],
    queryFn: () => getFollowers(profileId),
  });
};

export const useFollowing = (profileId: string) => {
  return useQuery({
    queryKey: ['profile-following', profileId],
    queryFn: () => getFollowing(profileId),
  });
};
