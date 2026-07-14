import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ArrowUp } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FeedCard } from './FeedCard';
import type { PostCardData } from '../types';

interface PaginatedPostListProps {
  fetchFn: (
    limit: number,
    page: number,
  ) => Promise<{
    posts: PostCardData[];
    total: number;
    page: number;
    limit: number;
  }>;
  initialLimit?: number;
  queryKey: string[];
  selectedTags?: Set<string>;
  onPostsChange?: (posts: PostCardData[]) => void;
  onLike?: (postId: string) => void;
  onBookmark?: (postId: string) => void;
  onComment?: (postId: string) => void;
}

export function PaginatedPostList({
  fetchFn,
  initialLimit = 10,
  queryKey,
  selectedTags,
  onPostsChange,
  onComment,
}: PaginatedPostListProps): React.ReactNode {
  const navigate = useNavigate();
  const [allPosts, setAllPosts] = useState<PostCardData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialSyncDone = useRef(false);
  const onPostsChangeRef = useRef(onPostsChange);
  onPostsChangeRef.current = onPostsChange;

  const { isLoading: isInitialLoading } = useQuery({
    queryKey: [...queryKey, 1],
    queryFn: () => fetchFn(initialLimit, 1),
  });

  const { data: initialData } = useQuery({
    queryKey: [...queryKey, 1],
    queryFn: () => fetchFn(initialLimit, 1),
  });

  useEffect(() => {
    if (initialData && !initialSyncDone.current) {
      initialSyncDone.current = true;
      setAllPosts(initialData.posts);
      setHasMore(initialData.posts.length === initialLimit);
    }
  }, [initialData, initialLimit]);

  useEffect(() => {
    onPostsChangeRef.current?.(allPosts);
  }, [allPosts]);

  const displayedPosts =
    selectedTags && selectedTags.size > 0
      ? allPosts.filter((post) => post.tags?.some((t) => selectedTags.has(t.tagId)))
      : allPosts;

  const handlePostClick = (postId: string) => {
    void navigate({ to: `/post/${postId}` });
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = await fetchFn(initialLimit, nextPage);
      setAllPosts((prev) => [...prev, ...data.posts]);
      setCurrentPage(nextPage);
      setHasMore(data.posts.length === initialLimit);
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const estimateSize = useCallback(() => 200, []);
  const measureElement = useCallback(
    (el: Element | null) => (el as HTMLElement)?.getBoundingClientRect?.().height ?? 200,
    [],
  );

  const virtualizer = useVirtualizer({
    count: displayedPosts.length,
    getScrollElement: () => scrollRef.current,
    estimateSize,
    measureElement,
    overscan: 3,
  });

  if (isInitialLoading) {
    return <div className="text-muted-foreground p-4 text-center">Loading posts...</div>;
  }

  if (allPosts.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground flex h-40 items-center justify-center">
          No posts available.
        </CardContent>
      </Card>
    );
  }

  if (displayedPosts.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground flex h-40 items-center justify-center">
          没有符合条件的帖子
        </CardContent>
      </Card>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      <div ref={scrollRef} className="no-scrollbar h-[70vh] overflow-y-auto pr-1">
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: `${virtualizer.getTotalSize()}px`,
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className="pb-4"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <FeedCard
                post={displayedPosts[virtualItem.index]}
                onClick={() => handlePostClick(displayedPosts[virtualItem.index].id)}
                onComment={() => onComment?.(displayedPosts[virtualItem.index].id)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        {hasMore ? (
          <Button
            variant="outline"
            onClick={() => void handleLoadMore()}
            disabled={isLoadingMore}
            className="px-8"
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </Button>
        ) : (
          <Button variant="ghost" onClick={handleScrollToTop} className="gap-2 px-8">
            <ArrowUp className="h-4 w-4" />
            回到顶部
          </Button>
        )}
      </div>
    </div>
  );
}

export default PaginatedPostList;
