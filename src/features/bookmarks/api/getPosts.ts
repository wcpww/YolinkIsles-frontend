import axiosInstance from '@/api/axiosInstance';
import type { PostCardData } from '../types';

interface GetPostsParams {
  limit?: number;
}

interface GetPostsResponse {
  code: number;
  message: string;
  data: {
    posts: PostCardData[];
  };
}

export interface GetPostsParamsWithPagination extends GetPostsParams {
  limit: number;
  page: number;
}

export interface GetPostsResponseWithPagination {
  code: number;
  message: string;
  data: {
    posts: PostCardData[];
    total: number;
    page: number;
    limit: number;
  };
}

// Get featured posts for the home page
export const getFeaturedPosts = async (): Promise<PostCardData[]> => {
  const response = await axiosInstance.get<GetPostsResponse>('/posts/featured');

  return response.data.data.posts;
};

// Get recommended posts for the home page
// TODO: Pageination design should be changed in the future.
export const getRecommendPosts = async (
  limit: number,
  page: number,
): Promise<GetPostsResponseWithPagination['data']> => {
  const response = await axiosInstance.get<GetPostsResponseWithPagination>('/posts/recommend', {
    params: {
      limit,
      page,
    },
  });

  return response.data.data;
};

// Get hot posts for the home page
// TODO: Pageination design should be changed in the future.
export const getHotPosts = async (
  limit: number,
  page: number,
): Promise<GetPostsResponseWithPagination['data']> => {
  const response = await axiosInstance.get<GetPostsResponseWithPagination>('/posts/hot', {
    params: {
      limit,
      page,
    },
  });

  return response.data.data;
};

// Get posts from authors the user is following
// TODO: Pageination design should be changed in the future.
export const getFollowingPosts = async (
  limit: number,
  page: number,
): Promise<GetPostsResponseWithPagination['data']> => {
  const response = await axiosInstance.get<GetPostsResponseWithPagination>('/posts/following', {
    params: {
      limit,
      page,
    },
  });

  return response.data.data;
};
