import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ArrowUp, BarChart2, Clock, Search, Tags, X } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getViewedPosts } from '../api/getViewedPosts';
import { PostCardSkeleton } from '../components/CardSkeleton';
import { HistoryCard } from '../components/HistoryCard';
import { useHistoryFilterStore } from '../store/useHistoryFilterStore';
import type { PostCardData, Tag } from '../types';

const LIMIT = 10;

export default function HistoryPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const { selectedTags, toggleTag, clearTags } = useHistoryFilterStore();

  const [allPosts, setAllPosts] = useState<PostCardData[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageCount, setCurrentPageCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { isLoading: isInitialLoading } = useQuery({
    queryKey: ['viewed-posts', 1],
    queryFn: () => getViewedPosts(LIMIT, 1),
  });

  const { data: initialData } = useQuery({
    queryKey: ['viewed-posts', 1],
    queryFn: () => getViewedPosts(LIMIT, 1),
  });

  if (initialData && allPosts.length === 0) {
    setAllPosts(initialData.posts);
    setCurrentPageCount(initialData.posts.length);
  }

  const hasMore = currentPageCount === LIMIT;

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = await getViewedPosts(LIMIT, nextPage);
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

  // Extract unique tags from all loaded posts
  const allTags = useMemo<Tag[]>(() => {
    const tagMap = new Map<string, Tag>();
    for (const post of allPosts) {
      for (const tag of post.tags ?? []) {
        if (!tagMap.has(tag.tagId)) tagMap.set(tag.tagId, tag);
      }
    }
    return Array.from(tagMap.values());
  }, [allPosts]);

  // Filter loaded posts by search query and selected tags
  const filteredPosts = useMemo<PostCardData[]>(() => {
    return allPosts.filter((post) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        post.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesTag =
        selectedTags.size === 0 || post.tags?.some((t) => selectedTags.has(t.tagId));
      return matchesSearch && matchesTag;
    });
  }, [allPosts, searchQuery, selectedTags]);

  const handlePostClick = (postId: string) => {
    void navigate({ to: '/post/$postId', params: { postId } });
  };

  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
      <div className="flex items-center gap-2">
        <Clock className="size-6" />
        <h1 className="text-2xl font-bold">最近浏览</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Post list */}
        <div ref={containerRef} className="flex flex-col gap-4 lg:col-span-2">
          {isInitialLoading ? (
            Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground flex h-40 flex-col items-center justify-center gap-2">
                <Clock className="size-8 opacity-40" />
                <span>{allPosts.length > 0 ? '没有符合条件的帖子' : '暂无浏览记录'}</span>
              </CardContent>
            </Card>
          ) : (
            <>
              {filteredPosts.map((post: PostCardData) => (
                <HistoryCard key={post.id} post={post} onClick={() => handlePostClick(post.id)} />
              ))}

              {/* Pagination controls — only shown when not filtering */}
              {selectedTags.size === 0 && searchQuery.trim() === '' && (
                <div className="flex justify-center pt-2">
                  {hasMore ? (
                    <Button
                      variant="outline"
                      onClick={() => void handleLoadMore()}
                      disabled={isLoadingMore}
                      className="px-8"
                    >
                      {isLoadingMore ? '加载中...' : '加载更多'}
                    </Button>
                  ) : (
                    <Button variant="ghost" onClick={handleScrollToTop} className="gap-2 px-8">
                      <ArrowUp className="size-4" />
                      回到顶部
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="sticky flex flex-col gap-4 lg:top-20 lg:col-span-1 lg:self-start">
          {/* Search Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="size-4" />
                搜索记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input
                  className="pr-9 pl-9"
                  placeholder="按标题搜索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors"
                    onClick={() => setSearchQuery('')}
                    aria-label="清除搜索"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart2 className="size-4" />
                统计
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">已加载条数</span>
                <span className="font-semibold">{allPosts.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">当前筛选</span>
                <span className="font-semibold">{filteredPosts.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tag Cloud Card */}
          {allTags.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Tags className="size-4" />
                  标签筛选
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <Badge
                      key={tag.tagId}
                      onClick={() => toggleTag(tag.tagId)}
                      className={
                        selectedTags.has(tag.tagId)
                          ? 'bg-primary text-primary-foreground hover:bg-primary/80 cursor-pointer rounded-full px-3 py-1 text-xs transition-colors'
                          : 'bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer rounded-full px-3 py-1 text-xs transition-colors'
                      }
                    >
                      {tag.tagName}
                    </Badge>
                  ))}
                </div>
                {selectedTags.size > 0 && (
                  <button
                    className="text-muted-foreground hover:text-foreground mt-3 flex items-center gap-1 text-xs transition-colors"
                    onClick={clearTags}
                  >
                    <X className="size-3" />
                    清除筛选
                  </button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
