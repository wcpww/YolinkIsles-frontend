import { useNavigate } from '@tanstack/react-router';
import { BarChart2, BookOpen, Hash, Plus, Search, Tags, Users, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { CardSkeleton } from '../components/CardSkeleton';
import { TagCard } from '../components/TagCard';
import { useTagDetail } from '../hooks/useTagDetail';
import { useTagPosts } from '../hooks/useTagPosts';
import { useToggleTagFollow } from '../hooks/useToggleTagFollow';
import { useTagFilterStore } from '../store/useTagFilterStore';
import type { PostCardData, Tag } from '../types';

interface TagPageProps {
  tagId: string;
}

export default function TagPage({ tagId }: TagPageProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { selectedTags, toggleTag, clearTags } = useTagFilterStore();

  const { data: tagDetail } = useTagDetail(tagId);
  const { data: posts = [], isLoading: isPostsLoading } = useTagPosts(tagId);
  const toggleFollowMutation = useToggleTagFollow(tagId);

  // Reset extra tag filters when the page tag changes
  useEffect(() => {
    clearTags();
  }, [tagId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derive current tag info from posts (fallback until tagDetail loads)
  const currentTagFromPosts = useMemo(() => {
    for (const post of posts) {
      const found = post.tags.find((t) => t.tagId === tagId);
      if (found) return found;
    }
    return null;
  }, [posts, tagId]);
  const currentTag = tagDetail ?? currentTagFromPosts;

  // All other unique tags from posts (excluding current page tag)
  const otherTags = useMemo<Tag[]>(() => {
    const tagMap = new Map<string, Tag>();
    for (const post of posts) {
      for (const tag of post.tags) {
        if (tag.tagId !== tagId && !tagMap.has(tag.tagId)) {
          tagMap.set(tag.tagId, tag);
        }
      }
    }
    return Array.from(tagMap.values());
  }, [posts, tagId]);

  const filteredPosts = useMemo<PostCardData[]>(() => {
    return posts.filter((post) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        post.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
      const matchesTag =
        selectedTags.size === 0 || post.tags.some((t) => selectedTags.has(t.tagId));
      return matchesSearch && matchesTag;
    });
  }, [posts, searchQuery, selectedTags]);

  const handlePostClick = (postId: string) => {
    void navigate({ to: '/post/$postId', params: { postId } });
  };

  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-6xl flex-col gap-6 p-4">
      {/* Tag Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
          <Hash className="text-primary size-6" strokeWidth={2.5} />
        </div>
        <div>
          {!currentTag ? (
            <>
              <Skeleton className="mb-1 h-7 w-32" />
              <Skeleton className="h-4 w-48" />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{currentTag?.tagName ?? tagId}</h1>
              <p className="text-muted-foreground text-sm">
                {currentTag?.numTagPosts ?? 0} 篇文章 · {currentTag?.numTagFollowers ?? 0} 位关注者
              </p>
            </>
          )}
        </div>
        {currentTag && (
          <Button
            variant={currentTag.isFollowing ? 'outline' : 'default'}
            size="sm"
            disabled={toggleFollowMutation.isPending}
            onClick={() => toggleFollowMutation.mutate()}
            className="gap-1"
          >
            {toggleFollowMutation.isPending ? (
              <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : currentTag.isFollowing ? (
              <Users className="size-3.5" />
            ) : (
              <Plus className="size-3.5" />
            )}
            {currentTag.isFollowing ? '已关注' : '关注标签'}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Post list */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {isPostsLoading ? (
            Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="text-muted-foreground flex h-40 flex-col items-center justify-center gap-2">
                <Hash className="size-8 opacity-40" />
                <span>{posts.length > 0 ? '没有符合条件的帖子' : '该标签下暂无文章'}</span>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post: PostCardData) => (
              <TagCard
                key={post.id}
                post={post}
                currentTag={currentTag ?? undefined}
                onClick={() => handlePostClick(post.id)}
              />
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
                搜索文章
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
                标签统计
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <BookOpen className="size-3.5" />
                  总文章数
                </span>
                <span className="font-semibold">{currentTag?.numTagPosts ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Users className="size-3.5" />
                  关注者
                </span>
                <span className="font-semibold">{currentTag?.numTagFollowers ?? 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Search className="size-3.5" />
                  当前筛选
                </span>
                <span className="font-semibold">{filteredPosts.length}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tag cloud card */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Tags className="size-4" />
                  标签筛选
                </CardTitle>
                {selectedTags.size > 0 && (
                  <button
                    className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                    onClick={clearTags}
                  >
                    清除
                  </button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {/* Current page tag — always first, always active, non-dismissible */}
              {currentTag && (
                <Badge className="bg-primary text-primary-foreground cursor-default text-xs">
                  {currentTag.tagName}
                </Badge>
              )}
              {/* Other tags from posts — multi-selectable */}
              {otherTags.map((tag) => (
                <Badge
                  key={tag.tagId}
                  className={cn(
                    'cursor-pointer text-xs transition-colors',
                    selectedTags.has(tag.tagId)
                      ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                      : 'bg-primary/10 text-primary hover:bg-primary/20',
                  )}
                  onClick={() => toggleTag(tag.tagId)}
                >
                  {tag.tagName}
                </Badge>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
