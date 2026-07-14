import { useQuery } from '@tanstack/react-query';
import { ArrowUp } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FeedCard } from '@/features/home/components/FeedCard';
import type { PostCardData } from '@/features/profile/types';

/**
 * 分页加载列表组件
 *
 * 自动处理分页逻辑，显示对应数量的卡片，支持"加载更多"和"回到顶部"功能。
 *
 * @example
 * ```tsx
 * import { PaginatedPostList } from '@/features/home/components/PaginatedPostList';
 * import { getRecentPosts } from '@/features/home/api/getRecentPosts';
 *
 * export function MyComponent() {
 *   return (
 *     <PaginatedPostList
 *       fetchFn={getRecentPosts}
 *       initialLimit={10}
 *       queryKey={['recent-posts']}
 *     />
 *   );
 * }
 * ```
 *
 * 工作流程：
 * 1. 初始化：加载第1页（limit条数据）
 * 2. 判断是否有更多：
 *    - 如果返回数据数 = limit → 显示"Load More"按钮
 *    - 如果返回数据数 < limit → 显示"Back to Top"按钮（已到最后）
 * 3. 用户点击"Load More" → 加载下一页，数据追加到列表底部
 * 4. 用户点击"Back to Top" → 平滑滚动回到列表顶部
 */
interface PaginatedPostListProps {
  /**
   * 数据获取函数
   * @param limit 每页加载的数据量
   * @param page 请求的页码（从1开始）
   * @returns 包含posts数组和分页信息的Promise
   */
  fetchFn: (
    limit: number,
    page: number,
  ) => Promise<{
    posts: PostCardData[];
    total: number;
    page: number;
    limit: number;
  }>;

  /**
   * 每页加载的数据量，默认为10
   * 影响"Load More"按钮何时出现的判断
   */
  initialLimit?: number;

  /**
   * React Query的缓存key
   * 用于区分不同的数据源，避免缓存冲突
   * @example ['recent-posts'] | ['user-posts', userId]
   */
  queryKey: string[];
}

export function PaginatedPostList({
  fetchFn,
  initialLimit = 10,
  queryKey,
}: PaginatedPostListProps) {
  const [allPosts, setAllPosts] = useState<PostCardData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageCount, setCurrentPageCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { isLoading: isInitialLoading } = useQuery({
    queryKey: [...queryKey, 1],
    queryFn: () => fetchFn(initialLimit, 1),
  });

  // 初始化数据
  const { data: initialData } = useQuery({
    queryKey: [...queryKey, 1],
    queryFn: () => fetchFn(initialLimit, 1),
  });

  if (initialData && allPosts.length === 0) {
    setAllPosts(initialData.posts);
    setCurrentPageCount(initialData.posts.length);
  }

  // 判断是否有更多数据：本次返回的数量等于 limit 说明还有更多
  const hasMore = currentPageCount === initialLimit;

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = await fetchFn(initialLimit, nextPage);

      setAllPosts((prev) => [...prev, ...data.posts]);
      setCurrentPage(nextPage);
      setCurrentPageCount(data.posts.length);
    } catch (error) {
      console.error('Failed to load more posts:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleScrollToTop = () => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  return (
    <div ref={containerRef} className="flex flex-col gap-4">
      {allPosts.map((post: PostCardData) => (
        <FeedCard key={post.id} post={post} />
      ))}

      <div className="flex justify-center pt-4">
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
            Back to Top
          </Button>
        )}
      </div>
    </div>
  );
}

export default PaginatedPostList;
