// src/features/profile/components/ProfilePage.tsx

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { ChevronLeft, Ellipsis, Mars, Venus } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FeedCard } from '@/features/home/components/FeedCard';
import type { User } from '@/features/home/types/User';
import { cn } from '@/lib/utils';
import { reportUser } from '../api/reportUser';
import { toggleFollow } from '../api/toggleFollow';
import ArticleCard from '../components/ArticleCard';
import CommentSection from '../components/CommentSection';
import PinnedCard from '../components/PinnedCard';
import ProfileSkeleton from '../components/ProfileSkeleton';
import { useLikedPosts, usePinnedPosts, useUserPosts } from '../hooks/usePosts';
import { useProfile } from '../hooks/useProfile';
import { useProfileFilterStore } from '../store/useProfileFilterStore';
import type { PostCardData } from '../types';

interface ProfilePageProps {
  profileId: string;
}

export default function ProfilePage({ profileId }: ProfilePageProps) {
  const navigate = useNavigate();
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
  } = useProfile(profileId);
  const { data: pinnedPostsData } = usePinnedPosts(profileId);
  const { data: publishPostsData, isLoading: isPublishPostsLoading } = useUserPosts(profileId);
  const { data: likedPostsData, isLoading: isLikedPostsLoading } = useLikedPosts(profileId);

  const profile = profileData || ({} as User);
  const pinnedPosts = pinnedPostsData || [];
  const publishPosts = publishPostsData || [];
  const likedPosts = likedPostsData || [];

  const { selectedTags, toggleTag, clearTags } = useProfileFilterStore();
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

  const queryClient = useQueryClient();
  const queryKey = ['userProfile', profileId] as const;

  const [isFollowing, setIsFollowing] = useState(false);
  useEffect(() => {
    if (profileData) setIsFollowing(profileData.isFollowing ?? false);
  }, [profileData]);

  const followMutation = useMutation({
    mutationFn: () => toggleFollow(profileId),
    onMutate: () => setIsFollowing((prev) => !prev),
    onSuccess: (data) => {
      setIsFollowing(data.isFollowing);
      queryClient.setQueryData(queryKey, (old: typeof profileData) =>
        old
          ? {
              ...old,
              isFollowing: data.isFollowing,
              stats: { ...old.stats, followers: data.numFollowers },
            }
          : old,
      );
    },
    onError: () => {
      setIsFollowing((prev) => !prev);
      toast.error('操作失败，请重试');
    },
  });

  const [isReporting, setIsReporting] = useState(false);
  const handleReportUser = async () => {
    if (isReporting) return;
    setIsReporting(true);
    try {
      await reportUser(profileId);
      toast.success('举报已提交，感谢你的反馈');
    } catch {
      toast.error('举报失败，请重试');
    } finally {
      setIsReporting(false);
    }
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/profile/${profileId}`;
    if (navigator.share) {
      void navigator.share({ title: profile.username, url });
    } else {
      void navigator.clipboard.writeText(url).then(() => toast.success('链接已复制到剪贴板'));
    }
  };

  // Scroll handling for horizontal pinned posts section
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [isBannerLoading, setIsBannerLoading] = useState(true);

  // Scroll handler function for pinned posts section
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = direction === 'left' ? -(clientWidth / 3) : clientWidth / 3;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Check scroll position to determine if scroll arrows should be shown
  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const handlePostClick = (postId: string) => {
    void navigate({ to: `/post/${postId}` });
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [pinnedPostsData]);

  if (isProfileLoading) return <ProfileSkeleton />;
  if (profileError || !profileData)
    return <div className="text-destructive p-4 text-center">Failed to load profile.</div>;

  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
      {/* /* Header Container */}
      <div className="bg-card relative flex flex-col rounded-lg border">
        <div className="bg-muted relative h-32 w-full overflow-hidden rounded-t-lg rounded-b-none md:h-48">
          {profile.bannerUrl && (
            <img
              src={getSrcPath(profile.bannerUrl, OSS_STYLE_PARAMETERS.HERO)}
              alt=""
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-opacity duration-600',
                isBannerLoading ? 'opacity-0' : 'opacity-100',
              )}
              onLoad={() => setIsBannerLoading(false)}
              onError={() => setIsBannerLoading(false)}
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
            <Button
              variant={isFollowing ? 'secondary' : 'default'}
              className="rounded-full"
              onClick={() => followMutation.mutate()}
              disabled={followMutation.isPending}
            >
              {isFollowing ? '已关注' : '关注'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-32">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={handleShareProfile}>分享主页</DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    disabled={isReporting}
                    onClick={() => void handleReportUser()}
                  >
                    举报用户
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <TabsTrigger value="liked">赞过</TabsTrigger>
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
                      暂无文章
                    </CardContent>
                  </Card>
                ) : (
                  displayedPublishPosts.map((post: PostCardData) => (
                    <ArticleCard
                      key={post.id}
                      post={post}
                      onClick={() => handlePostClick(post.id)}
                    />
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="liked">
              <div className="mt-2 flex flex-col gap-4">
                {isLikedPostsLoading ? (
                  <div className="text-muted-foreground p-4 text-center">
                    Loading liked posts...
                  </div>
                ) : likedPosts.length === 0 ? (
                  <Card>
                    <CardContent className="text-muted-foreground flex h-75 items-center justify-center">
                      暂无点赞记录
                    </CardContent>
                  </Card>
                ) : (
                  displayedLikedPosts.map((post: PostCardData) => (
                    <FeedCard key={post.id} post={post} onClick={() => handlePostClick(post.id)} />
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
                <div className="flex-1">
                  <div className="text-foreground text-sm font-semibold">
                    {profile.stats.following}
                  </div>
                  <p className="text-muted-foreground text-xs">关注</p>
                </div>
                <div className="flex-1 border-x">
                  <div className="text-foreground text-sm font-semibold">
                    {profile.stats.followers}
                  </div>
                  <p className="text-muted-foreground text-xs">粉丝</p>
                </div>
                <div className="flex-1">
                  <div className="text-foreground text-sm font-semibold">
                    {profile.stats.totalLikes}
                  </div>
                  <p className="text-muted-foreground text-xs">获赞</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <CommentSection userId={profileId} />
        </div>
      </div>
    </div>
  );
}
