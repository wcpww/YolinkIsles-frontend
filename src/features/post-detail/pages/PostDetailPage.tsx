import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { Bookmark, Heart, Share2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { toggleBookmark } from '@/features/me/api/toggleBookmark';
import { toggleLike } from '@/features/me/api/toggleLike';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CommentSection } from '../components/CommentSection';
import { MarkdownDisplay } from '../components/MarkdownDisplay';
import PostDetailSkeleton from '../components/PostDetailSkeleton';
import PostHeader from '../components/PostHeader';
import { usePostDetail, usePostComments } from '../hooks';

interface PostDetailPageProps {
  postId: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]/g, '');
}

function extractToc(json: unknown): TocItem[] {
  if (typeof json !== 'object' || json === null) return [];
  const nodes = (json as Record<string, unknown>).content;
  if (!Array.isArray(nodes)) return [];
  return (nodes as Record<string, unknown>[])
    .filter((n) => n.type === 'heading')
    .map((n) => {
      const children = Array.isArray(n.content) ? (n.content as Record<string, unknown>[]) : [];
      const text = children.map((t) => (typeof t.text === 'string' ? t.text : '')).join('');
      const attrs = n.attrs as Record<string, unknown> | undefined;
      return { id: slugifyHeading(text), text, level: (attrs?.level as number) ?? 1 };
    });
}

export default function PostDetailPage({ postId }: PostDetailPageProps) {
  const navigate = useNavigate();

  const { data: post, isLoading, error } = usePostDetail(postId);
  const { data: comments = [], isLoading: isCommentsLoading } = usePostComments(postId, 3, !!post);

  const queryClient = useQueryClient();
  const queryKey = ['post', postId] as const;

  const likeMutation = useMutation({
    mutationFn: () => toggleLike(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<typeof post>(queryKey);
      queryClient.setQueryData(queryKey, (old: typeof post) =>
        old
          ? {
              ...old,
              interactions: { ...old.interactions, isLiked: !old.interactions.isLiked },
              stats: {
                ...old.stats,
                numLikes: old.interactions.isLiked
                  ? old.stats.numLikes - 1
                  : old.stats.numLikes + 1,
              },
            }
          : old,
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev);
      toast.error('操作失败，请重试');
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, (old: typeof post) =>
        old
          ? { ...old, interactions: { ...old.interactions, isLiked: data.isLiked }, stats: { ...old.stats, numLikes: data.likes } }
          : old,
      );
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmark(postId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const prev = queryClient.getQueryData<typeof post>(queryKey);
      queryClient.setQueryData(queryKey, (old: typeof post) =>
        old
          ? { ...old, interactions: { ...old.interactions, isBookmarked: !old.interactions.isBookmarked } }
          : old,
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(queryKey, ctx.prev);
      toast.error('操作失败，请重试');
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, (old: typeof post) =>
        old
          ? { ...old, interactions: { ...old.interactions, isBookmarked: data.isBookmarked } }
          : old,
      );
    },
  });

  const [activeId, setActiveId] = useState<string>('');

  // Generate TOC from content JSON. Memoize to avoid unnecessary recalculations on re-renders.
  const toc = useMemo(() => (post?.contentJson ? extractToc(post.contentJson) : []), [post]);

  // Set up IntersectionObserver to track which heading is currently active in the viewport
  useEffect(() => {
    if (toc.length === 0) return;
    const headingEls = toc
      .map(({ id }) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const topmost = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
          );
          setActiveId(topmost.target.id);
        }
      },
      { rootMargin: '0px 0px -70% 0px', threshold: 0 },
    );

    headingEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  // TODO: Loading skeleton.
  if (isLoading) return <PostDetailSkeleton />;

  // TODO: Error page.
  if (error || !post)
    return <div className="text-destructive p-4 text-center">Failed to load post.</div>;

  return (
    <div className="animate-in fade-in w-full">
      <PostHeader
        post={post}
        onTagClick={(tagId) => void navigate({ to: '/tag/$tagId', params: { tagId } })}
      />

      {/* Main content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex gap-12">
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-8">
              {/* Article body */}
              <div className="prose dark:prose-invert max-w-none">
                {post.contentJson ? (
                  <MarkdownDisplay json={post.contentJson} />
                ) : post.contentMd ? (
                  <div className="whitespace-pre-wrap">{post.contentMd}</div>
                ) : (
                  <p className="text-muted-foreground">No content available.</p>
                )}
              </div>

              {/* Action bar */}
              <div className="flex flex-col items-center gap-3 py-2">
                <p className="text-muted-foreground text-xs">觉得有帮助？给作者点个赞吧</p>
                <div className="flex items-center gap-3">
                  <Button
                    variant={post.interactions.isLiked ? 'default' : 'outline'}
                    size="default"
                    className="gap-2 rounded-full px-6"
                    onClick={() => likeMutation.mutate()}
                    disabled={likeMutation.isPending}
                  >
                    <Heart
                      className="h-4 w-4"
                      {...(post.interactions.isLiked ? { fill: 'currentColor' } : {})}
                    />
                    {post.stats.numLikes} 点赞
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    className="gap-2 rounded-full px-5"
                    onClick={() => bookmarkMutation.mutate()}
                    disabled={bookmarkMutation.isPending}
                  >
                    {post.interactions.isBookmarked ? (
                      <Bookmark className="h-4 w-4 text-blue-500" fill="currentColor" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                    收藏
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    className="gap-2 rounded-full px-5"
                    onClick={() => {
                      const url = window.location.href;
                      if (navigator.share) {
                        void navigator.share({ title: post.title, url });
                      } else {
                        void navigator.clipboard.writeText(url).then(() => toast.success('链接已复制'));
                      }
                    }}
                  >
                    <Share2 className="h-4 w-4" />
                    分享
                  </Button>
                </div>
              </div>

              {/* Comment section */}
              <CommentSection
                postId={postId}
                numComments={post.stats.numComments}
                comments={comments}
                isLoading={isCommentsLoading}
              />

              {/* Related posts */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold">同标签下的帖子</CardTitle>
                </CardHeader>
                <CardContent className="text-muted-foreground flex h-32 items-center justify-center text-sm">
                  即将推出…
                </CardContent>
              </Card>
            </div>
          </div>

          {/* TOC Sidebar */}
          {toc.length > 0 && (
            <aside className="hidden w-52 shrink-0 xl:block">
              <div className="sticky top-20">
                <p className="text-muted-foreground mb-2 text-sm font-semibold tracking-widest uppercase">
                  目录
                </p>
                <nav className="flex flex-col gap-0.5">
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        const el = document.getElementById(item.id);
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          setActiveId(item.id);
                        }
                      }}
                      style={{ paddingLeft: `${(item.level - 1) * 0.75}rem` }}
                      className={cn(
                        'line-clamp-2 py-0.5 text-sm transition-colors',
                        activeId === item.id
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground hover:text-foreground',
                      )}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
