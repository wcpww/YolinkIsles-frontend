import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from '@tanstack/react-router';
import { ChevronLeft, Mars, Pencil, Share2, Venus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toggleBookmark } from '../api/toggleBookmark';
import { toggleLike } from '../api/toggleLike';
import ArticleCard from '../components/ArticleCard';
import CommentSection from '../components/CommentSection';
import FollowListDialog from '../components/FollowListDialog';
import PinnedCard from '../components/PinnedCard';
import ProfileSkeleton from '../components/ProfileSkeleton';
import { useFollowers, useFollowing } from '../hooks/useFollowList';
import { useLikedPosts, usePinnedPosts, useUserPosts } from '../hooks/usePosts';
import { useProfile } from '../hooks/useProfile';
import { useMeFilterStore } from '../store/useMeFilterStore';
import type { PostCardData } from '../types';
import type { User } from '../types/User';

type FollowDialogType = 'followers' | 'following' | null;

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: profileData, isLoading: isProfileLoading, error: profileError } = useProfile();
  const { data: pinnedPostsData } = usePinnedPosts();
  const { data: publishPostsData, isLoading: isPublishPostsLoading } = useUserPosts();
  const { data: likedPostsData, isLoading: isLikedPostsLoading } = useLikedPosts();

  // Follow list dialog state
  const [followDialog, setFollowDialog] = useState<FollowDialogType>(null);

  const { data: followersData, isLoading: isFollowersLoading } = useFollowers();
  const { data: followingData, isLoading: isFollowingLoading } = useFollowing();

  const followersIds = useMemo(
    () => new Set((followersData ?? []).map((u) => u.id)),
    [followersData],
  );
  const followingIds = useMemo(
    () => new Set((followingData ?? []).map((u) => u.id)),
    [followingData],
  );

  const queryClient = useQueryClient();
  const postQueryKeys = [['me-posts'], ['me-pinned-posts'], ['me-liked-posts']] as const;

  const likeMutation = useMutation({
    mutationFn: toggleLike,
    onMutate: async (postId) => {
      await Promise.all(postQueryKeys.map((key) => queryClient.cancelQueries({ queryKey: key })));
      const snapshots = postQueryKeys.map(
        (key) => queryClient.getQueryData<PostCardData[]>(key) ?? null,
      );

      postQueryKeys.forEach((key) => {
        queryClient.setQueryData<PostCardData[]>(key, (old) =>
          old?.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  interactions: { ...p.interactions, isLiked: !p.interactions.isLiked },
                  stats: {
                    ...p.stats,
                    numLikes: p.interactions.isLiked ? p.stats.numLikes - 1 : p.stats.numLikes + 1,
                  },
                }
              : p,
          ),
        );
      });

      return { snapshots };
    },
    onSuccess: (data, postId) => {
      postQueryKeys.forEach((key) => {
        queryClient.setQueryData<PostCardData[]>(key, (old) =>
          old?.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  interactions: { ...p.interactions, isLiked: data.isLiked },
                  stats: { ...p.stats, numLikes: data.likes },
                }
              : p,
          ),
        );
      });
    },
    onError: (_err, _postId, context) => {
      context?.snapshots.forEach((snapshot, i) => {
        if (snapshot !== null) {
          queryClient.setQueryData(postQueryKeys[i], snapshot);
        }
      });
      toast.error('操作失败，请重试');
    },
  });

  const bookmarkMutation = useMutation({
    mutationFn: toggleBookmark,
    onMutate: async (postId) => {
      await Promise.all(postQueryKeys.map((key) => queryClient.cancelQueries({ queryKey: key })));
      const snapshots = postQueryKeys.map(
        (key) => queryClient.getQueryData<PostCardData[]>(key) ?? null,
      );

      postQueryKeys.forEach((key) => {
        queryClient.setQueryData<PostCardData[]>(key, (old) =>
          old?.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  interactions: { ...p.interactions, isBookmarked: !p.interactions.isBookmarked },
                }
              : p,
          ),
        );
      });

      return { snapshots };
    },
    onSuccess: (data, postId) => {
      postQueryKeys.forEach((key) => {
        queryClient.setQueryData<PostCardData[]>(key, (old) =>
          old?.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  interactions: { ...p.interactions, isBookmarked: data.isBookmarked },
                }
              : p,
          ),
        );
      });
    },
    onError: (_err, _postId, context) => {
      context?.snapshots.forEach((snapshot, i) => {
        if (snapshot !== null) {
          queryClient.setQueryData(postQueryKeys[i], snapshot);
        }
      });
      toast.error('操作失败，请重试');
    },
  });

  const handleCommentClick = (postId: string) => {
    void navigate({ to: `/post/${postId}` });
  };

  const profile = profileData || ({} as User);
  const pinnedPosts = pinnedPostsData || [];
  const publishPosts = publishPostsData || [];
  const likedPosts = likedPostsData || [];

  const { selectedTags, toggleTag, clearTags } = useMeFilterStore();
  const [activeTab, setActiveTab] = useState('articles');
  const activeTabPosts = activeTab === 'articles' ? publishPosts : likedPosts;
  const tabTagsByFreq = useMemo(() => {
    const freqMap = new Map<string, { tag: { tagId: string; tagName: string }; count: number }>();
    for (const post of activeTabPosts) {
      for (const tag of post.tags ?? []) {
        const entry = freqMap.get(tag.tagId);
        if (entry) {
          entry.count++;
        } else {
          freqMap.set(tag.tagId, { tag, count: 1 });
        }
      }
    }
    return Array.from(freqMap.values())
      .sort((a, b) => b.count - a.count)
      .map((e) => e.tag);
  }, [activeTabPosts]);
  const displayedPublishPosts =
    selectedTags.size > 0
      ? publishPosts.filter((p: PostCardData) => p.tags.some((t) => selectedTags.has(t.tagId)))
      : publishPosts;
  const displayedLikedPosts =
    selectedTags.size > 0
      ? likedPosts.filter((p: PostCardData) => p.tags.some((t) => selectedTags.has(t.tagId)))
      : likedPosts;

  // Scroll handling for horizontal pinned posts section
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === 'left' ? -(clientWidth / 3) : clientWidth / 3;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [pinnedPostsData]);

  const handlePostClick = (postId: string) => {
    void navigate({ to: `/post/${postId}` });
  };

  if (isProfileLoading) return <ProfileSkeleton />;
  if (profileError || !profileData)
    return <div className="text-destructive p-4 text-center">Failed to load profile.</div>;

  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
      {/* Follow List Dialogs */}
      <FollowListDialog
        open={followDialog === 'followers'}
        onOpenChange={(open) => setFollowDialog(open ? 'followers' : null)}
        title="粉丝"
        users={followersData}
        isLoading={isFollowersLoading}
        followersIds={followersIds}
        followingIds={followingIds}
      />
      <FollowListDialog
        open={followDialog === 'following'}
        onOpenChange={(open) => setFollowDialog(open ? 'following' : null)}
        title="关注"
        users={followingData}
        isLoading={isFollowingLoading}
        followersIds={followersIds}
        followingIds={followingIds}
      />

      {/* Header Container */}
      <div className="bg-card relative flex flex-col rounded-lg border">
        <div className="bg-muted h-32 w-full rounded-t-lg rounded-b-none md:h-48">
          {profile.bannerUrl && (
            <img
              src={getSrcPath(profile.bannerUrl, OSS_STYLE_PARAMETERS.HERO)}
              alt={profile.username}
              className="h-full w-full rounded-t-lg object-cover"
            />
          )}
        </div>

        <div className="-mt-10 mb-2 flex flex-wrap items-end justify-between gap-4 px-6">
          <div className="z-10 flex items-end gap-4">
            <Avatar className="border-background size-24 border-4">
              <AvatarImage
                src={getSrcPath(profile.avatarUrl, OSS_STYLE_PARAMETERS.AVATAR)}
                alt={profile.username}
              />
              <AvatarFallback>{profile.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <h1 className="mb-2 flex items-center gap-2 text-2xl font-bold">
              {profile.username}
              {profile.sexType === 'male' && (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Mars className="size-3" />
                </span>
              )}
              {profile.sexType === 'female' && (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-pink-500 text-white">
                  <Venus className="size-3" />
                </span>
              )}
            </h1>
          </div>

          <div className="z-10 mb-2 flex gap-2">
            <Link to="/settings">
              <Button variant="outline" className="rounded-full">
                <Pencil className="size-4" />
                编辑主页
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => {
                const url = `${window.location.origin}/profile/${profile.id}`;
                if (navigator.share) {
                  void navigator.share({ title: profile.username, url });
                } else {
                  void navigator.clipboard.writeText(url);
                }
              }}
            >
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-4 md:col-span-2">
          {/* Pinned Posts Section */}
          {pinnedPosts.length !== 0 && (
            <div className="group relative w-full">
              {/* Scroll Left Button */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  'absolute top-[calc(50%-1rem)] -left-10 z-2 size-8 cursor-pointer rounded-full shadow-md transition-opacity',
                  showLeftArrow ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  scroll('left');
                }}
              >
                <ChevronLeft className="size-5" />
              </Button>

              {/* Scroll Right Button */}
              <Button
                type="button"
                variant="outline"
                size="icon"
                className={cn(
                  'absolute top-[calc(50%-1rem)] right-0 z-2 size-8 cursor-pointer rounded-full shadow-md transition-opacity',
                  showRightArrow ? 'opacity-100' : 'pointer-events-none opacity-0',
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  scroll('right');
                }}
              >
                <ChevronLeft className="size-5 rotate-180" />
              </Button>

              {/* Scroll Container */}
              <div
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className={cn(
                  'no-scrollbar flex w-full gap-4 overflow-x-auto overflow-y-hidden',
                  'snap-x snap-mandatory scroll-smooth',
                  pinnedPosts.length > 3 && 'pr-10',
                )}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {pinnedPosts.map((post: PostCardData) => (
                  <PinnedCard
                    key={post.id}
                    post={post}
                    onClick={() => handlePostClick(post.id)}
                    className="h-52 w-[calc((100%-2rem)/3)] min-w-50"
                  />
                ))}
              </div>

              {/* Right Fade Overlay */}
              <div
                className={cn(
                  'from-background pointer-events-none absolute top-0 right-0 z-1 h-full w-10 bg-linear-to-l to-transparent transition-opacity duration-300',
                  showRightArrow ? 'opacity-100' : 'opacity-0',
                )}
              />
            </div>
          )}

          {/* Article Posts Section */}
          <Tabs
            defaultValue="articles"
            onValueChange={(tab) => {
              clearTags();
              setActiveTab(tab);
            }}
          >
            <div className="relative flex items-center gap-2 overflow-hidden">
              <TabsList className="shrink-0 border-0 tracking-widest">
                <TabsTrigger value="articles">文章</TabsTrigger>
                <TabsTrigger value="comments">赞过</TabsTrigger>
              </TabsList>

              {tabTagsByFreq.length > 0 && (
                <div className="min-w-0 flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                  <div className="flex gap-1.5 px-4">
                    {tabTagsByFreq.map((tag) => (
                      <Badge
                        key={tag.tagId}
                        onClick={() => toggleTag(tag.tagId)}
                        className={cn(
                          'h-7 shrink-0 cursor-pointer rounded-full px-2.5 text-xs whitespace-nowrap transition-colors',
                          selectedTags.has(tag.tagId)
                            ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                            : 'bg-primary/10 text-primary hover:bg-primary/80 hover:text-muted',
                        )}
                      >
                        {tag.tagName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <TabsContent value="articles">
              <div className="mt-2 flex flex-col gap-4">
                {isPublishPostsLoading ? (
                  <div className="text-muted-foreground p-4 text-center">Loading feed...</div>
                ) : publishPosts.length === 0 ? (
                  <Card>
                    <CardContent className="text-muted-foreground flex h-75 items-center justify-center">
                      No posts yet.
                    </CardContent>
                  </Card>
                ) : (
                  displayedPublishPosts.map((post: PostCardData) => (
                    <ArticleCard
                      key={post.id}
                      post={post}
                      onClick={() => handlePostClick(post.id)}
                      onLike={() => likeMutation.mutate(post.id)}
                      onBookmark={() => bookmarkMutation.mutate(post.id)}
                      onComment={() => handleCommentClick(post.id)}
                      onEdit={() => void navigate({ to: '/edit-post/$postId', params: { postId: post.id } })}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="comments">
              <div className="mt-2 flex flex-col gap-4">
                {isLikedPostsLoading ? (
                  <div className="text-muted-foreground p-4 text-center">
                    Loading liked posts...
                  </div>
                ) : likedPosts.length === 0 ? (
                  <Card>
                    <CardContent className="text-muted-foreground flex h-75 items-center justify-center">
                      No liked posts yet.
                    </CardContent>
                  </Card>
                ) : (
                  displayedLikedPosts.map((post: PostCardData) => (
                    <ArticleCard
                      key={post.id}
                      post={post}
                      onClick={() => handlePostClick(post.id)}
                      onLike={() => likeMutation.mutate(post.id)}
                      onBookmark={() => bookmarkMutation.mutate(post.id)}
                      onComment={() => handleCommentClick(post.id)}
                      onEdit={() => void navigate({ to: '/edit-post/$postId', params: { postId: post.id } })}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Side Widget Area (Right Column) */}
        <div className="flex flex-col gap-4 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>简介</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">{profile.bio}</p>
              <div className="mt-4 flex items-center justify-around border-t pt-3 text-center">
                <button
                  type="button"
                  className="hover:text-foreground flex-1 cursor-pointer transition-colors"
                  onClick={() => setFollowDialog('following')}
                >
                  <div className="text-foreground text-sm font-semibold">
                    {profile.stats.following}
                  </div>
                  <p className="text-muted-foreground text-xs">关注</p>
                </button>
                <button
                  type="button"
                  className="hover:text-foreground flex-1 cursor-pointer border-x transition-colors"
                  onClick={() => setFollowDialog('followers')}
                >
                  <div className="text-foreground text-sm font-semibold">
                    {profile.stats.followers}
                  </div>
                  <p className="text-muted-foreground text-xs">粉丝</p>
                </button>
                <div className="flex-1">
                  <div className="text-foreground text-sm font-semibold">
                    {profile.stats.totalLikes}
                  </div>
                  <p className="text-muted-foreground text-xs">获赞</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <CommentSection />
        </div>
      </div>
    </div>
  );
}
