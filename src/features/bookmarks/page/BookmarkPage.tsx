import { useNavigate } from '@tanstack/react-router';
import { BarChart2, Bookmark, Search, Tags, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FeedCard } from '../components/BookmarkedCard';
import { PostCardSkeleton } from '../components/CardSkeleton';
import { useBookmarkedPosts } from '../hooks/useBookmarkedPosts';
import { useBookmarkFilterStore } from '../store/useBookmarkFilterStore';
import type { PostCardData, Tag } from '../types';

export default function BookmarksPage() {
  const navigate = useNavigate();
  const { data: posts, isLoading, error } = useBookmarkedPosts();

  const [searchQuery, setSearchQuery] = useState('');
  const { selectedTags, toggleTag, clearTags } = useBookmarkFilterStore();

  // Extract unique tags from all posts
  const allTags = useMemo<Tag[]>(() => {
    if (!posts) return [];
    const tagMap = new Map<string, Tag>();
    for (const post of posts) {
      for (const tag of post.tags ?? []) {
        if (!tagMap.has(tag.tagId)) tagMap.set(tag.tagId, tag);
      }
    }
    return Array.from(tagMap.values());
  }, [posts]);

  // Filter posts by search query and selected tags (any selected tag must match)
  const filteredPosts = useMemo<PostCardData[]>(() => {
    if (!posts) return [];
    return posts.filter((post) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        post.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesTag =
        selectedTags.size === 0 || post.tags?.some((t) => selectedTags.has(t.tagId));
      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTags]);

  const handlePostClick = (postId: string) => {
    void navigate({ to: '/post/$postId', params: { postId } });
  };

  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
      <div className="flex items-center gap-2">
        <Bookmark className="size-6" />
        <h1 className="text-2xl font-bold">我的收藏</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Post list */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)
          ) : error ? (
            <Card>
              <CardContent className="text-destructive flex h-40 items-center justify-center">
                加载失败，请稍后再试。
              </CardContent>
            </Card>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground flex h-40 flex-col items-center justify-center gap-2">
                <Bookmark className="size-8 opacity-40" />
                <span>{posts && posts.length > 0 ? '没有符合条件的帖子' : '暂无收藏的帖子'}</span>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post: PostCardData) => (
              <FeedCard key={post.id} post={post} onClick={() => handlePostClick(post.id)} />
            ))
          )}
        </div>

        {/* Right: Sidebar */}
        <div className="sticky flex flex-col gap-4 lg:top-20 lg:col-span-1 lg:self-start">
          {/* Search Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="size-4" />
                搜索收藏
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
                <span className="text-muted-foreground">总收藏数</span>
                <span className="font-semibold">{posts?.length ?? 0}</span>
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
