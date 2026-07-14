import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getComments } from '../api/getComments';
import type { Comment } from '../types/Comment';

export const useComments = (limit: number = 10) => {
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const initialLoadedRef = useRef(false);

  const {
    data: initialData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['me-comments', 1],
    queryFn: () => getComments(limit, 1),
  });

  useEffect(() => {
    if (initialData && !initialLoadedRef.current) {
      initialLoadedRef.current = true;
      setAllComments(initialData.comments);
      setHasMore(initialData.comments.length === limit);
    }
  }, [initialData, limit]);

  const loadMore = useCallback(async () => {
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = await getComments(limit, nextPage);
      setAllComments((prev) => [...prev, ...data.comments]);
      setCurrentPage(nextPage);
      setHasMore(data.comments.length === limit);
    } catch (err) {
      console.error('Failed to load more comments:', err);
      toast.error('加载更多评论失败，请重试');
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, limit]);

  return {
    comments: allComments,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    error,
  };
};
