import { useQuery } from '@tanstack/react-query';
import { getLikedPosts, getPinnedPosts, getUserPosts } from '../api/getPosts';

export const useUserPosts = () => {
  return useQuery({
    queryKey: ['me-posts'],
    queryFn: async () => getUserPosts(),
  });
};

export const usePinnedPosts = () => {
  return useQuery({
    queryKey: ['me-pinned-posts'],
    queryFn: async () => getPinnedPosts(),
  });
};

export const useLikedPosts = () => {
  return useQuery({
    queryKey: ['me-liked-posts'],
    queryFn: async () => getLikedPosts(),
  });
};
