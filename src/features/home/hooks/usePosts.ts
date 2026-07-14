import { useQuery } from '@tanstack/react-query';
import { getFeaturedPosts } from '../api/getPosts';
import { getUser } from '../api/getUser';

export const useAuthorInfo = (authorId: string) => {
  return useQuery({
    queryKey: ['author', authorId],
    queryFn: () => getUser(authorId),
  });
};

// Custom hook to fetch featured posts for the home page
export const useFeaturedPosts = () => {
  return useQuery({
    queryKey: ['featured-posts'],
    queryFn: async () => getFeaturedPosts(),
  });
};

// TODO: Move query hooks to separate files in the future.

// // Custom hook to fetch recommended posts for the home page
// export const useRecommendPosts = () => {
//   return useQuery({
//     queryKey: ['recommend-posts'],
//     queryFn: async () => getRecommendPosts(),
//   });
// };

// // Custom hook to fetch hot posts for the home page
// export const useHotPosts = () => {
//   return useQuery({
//     queryKey: ['hot-posts'],
//     queryFn: async () => getHotPosts(),
//   });
// };

// // Custom hook to fetch posts from authors the user is following
// export const useFollowingPosts = () => {
//   return useQuery({
//     queryKey: ['following-posts'],
//     queryFn: async () => {
//       return getFollowingPosts();
//     },
//   });
// };
