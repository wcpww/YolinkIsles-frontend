import { useQuery } from '@tanstack/react-query';
import { getPinnedPosts, getUserPosts } from '../api/getPosts';

// Custom hook to fetch user posts for the profile page
export const useUserPosts = (userId: string) => {
  return useQuery({
    queryKey: ['user-posts', userId],
    queryFn: async () => getUserPosts(userId),
  });
};

// Custom hook to fetch pinned posts for the profile page
export const usePinnedPosts = (userId: string) => {
  return useQuery({
    queryKey: ['pinned-posts', userId],
    queryFn: async () => getPinnedPosts(userId),
  });
};

// Custom hook to fetch liked posts for the profile page
// FIXME: Currently using getUserPosts as a placeholder, replace with actual API call for liked posts when available
export const useLikedPosts = (userId: string) => {
  return useQuery({
    queryKey: ['liked-posts', userId],
    queryFn: async () => getUserPosts(userId),
  });
};
