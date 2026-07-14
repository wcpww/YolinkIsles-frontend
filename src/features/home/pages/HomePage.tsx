// src/features/home/pages/HomePage.tsx

import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import Autoplay from 'embla-carousel-autoplay';
import { Hash, Megaphone, MoveRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getTags } from '@/features/home/api/getTags';
import { cn } from '@/lib/utils';
import { getFollowingPosts, getHotPosts, getRecommendPosts } from '../api/getPosts';
import HeroCard from '../components/HeroCard';
import { PaginatedPostList } from '../components/PaginatedPostList';
import { useFeaturedPosts } from '../hooks/usePosts';
import { useHomeFilterStore } from '../store/useHomeFilterStore';
import type { PostCardData, Tag } from '../types';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: featuredData } = useFeaturedPosts();

  const featuredPosts = featuredData || [];

  const { data: tagsData, isLoading: isTagsLoading } = useQuery({
    queryKey: ['popular-tags'],
    queryFn: getTags,
  });

  const popularTags = tagsData || [];

  const [activeTab, setActiveTab] = useState('trending');
  const [tabPosts, setTabPosts] = useState<Record<string, PostCardData[]>>({});
  const { selectedTags, toggleTag, clearTags } = useHomeFilterStore();

  const handleTabChange = (tab: string) => {
    clearTags();
    setActiveTab(tab);
  };

  const handleComment = (postId: string) => {
    void navigate({ to: `/post/${postId}` });
  };

  // Tags sorted by frequency in the current tab's loaded posts
  const tabTagsByFreq = useMemo<Tag[]>(() => {
    const currentPosts = tabPosts[activeTab] ?? [];
    const freqMap = new Map<string, { tag: Tag; count: number }>();
    for (const post of currentPosts) {
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
  }, [tabPosts, activeTab]);

  return (
    <div className="mx-auto mt-4 flex w-full max-w-6xl flex-col">
      {/* Featured Post Section */}
      {featuredPosts.length !== 0 && (
        <>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3 text-lg font-bold tracking-widest">
              <div className="bg-primary size-2 rounded-full" />
              精选
            </div>
            <div className="ml-4 flex-1 border-t border-gray-300" />
          </div>

          <Carousel
            plugins={[
              Autoplay({
                delay: 8 * 1000,
                stopOnFocusIn: true,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
          >
            <CarouselContent className="px-2 py-4">
              {featuredPosts.map((post: PostCardData) => (
                <CarouselItem key={post.id} className="basis-full md:basis-1/2 lg:basis-1/3">
                  <HeroCard
                    post={post}
                    className="h-60"
                    onClick={() => void navigate({ to: `/post/${post.id}` })}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </>
      )}

      {/* Two-Column Content Layout */}
      <div className="grid grid-cols-1 gap-4 px-2 md:grid-cols-3">
        {/* Main Content (Left Column) */}
        <div className="flex flex-col gap-4 md:col-span-2">
          {/* Tabs Section */}
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <div className="relative flex items-center gap-2 overflow-hidden">
              <TabsList className="shrink-0 border-0 tracking-widest">
                <TabsTrigger value="trending">热点</TabsTrigger>
                <TabsTrigger value="latest">推荐</TabsTrigger>
                <TabsTrigger value="following">关注</TabsTrigger>
              </TabsList>

              {tabTagsByFreq.length > 0 && (
                <>
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
                </>
              )}
            </div>

            <TabsContent value="latest" className="mt-4" forceMount hidden={activeTab !== 'latest'}>
              <PaginatedPostList
                fetchFn={getRecommendPosts}
                initialLimit={10}
                queryKey={['recommend-posts']}
                selectedTags={selectedTags}
                onPostsChange={(posts) => setTabPosts((prev) => ({ ...prev, latest: posts }))}
                onComment={handleComment}
              />
            </TabsContent>

            <TabsContent value="trending" className="mt-4" forceMount hidden={activeTab !== 'trending'}>
              <PaginatedPostList
                fetchFn={getHotPosts}
                initialLimit={10}
                queryKey={['trending-posts']}
                selectedTags={selectedTags}
                onPostsChange={(posts) => setTabPosts((prev) => ({ ...prev, trending: posts }))}
                onComment={handleComment}
              />
            </TabsContent>

            <TabsContent value="following" className="mt-4" forceMount hidden={activeTab !== 'following'}>
              <PaginatedPostList
                fetchFn={getFollowingPosts}
                initialLimit={10}
                queryKey={['following-posts']}
                selectedTags={selectedTags}
                onPostsChange={(posts) => setTabPosts((prev) => ({ ...prev, following: posts }))}
                onComment={handleComment}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Side Widget Area (Right Column) */}
        <div className="flex flex-col gap-4 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <Megaphone className="text-primary/80 size-5" strokeWidth={3} />
                <span>通知</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: Announcement */}
              {/* {announcementData ? (
                <div className="space-y-3 text-sm">
                  <div className="border-border pb-3">
                    <h4 className="text-foreground font-semibold">{announcementData.title}</h4>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {announcementData.publisher} · {announcementData.createdAt}
                    </p>
                  </div>
                </div>
              ) : ( */}
              <div className="text-muted-foreground p-4 text-center text-sm">No announcements.</div>
              {/* )} */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-4">
                <Hash className="text-primary/80 size-5" strokeWidth={3} />
                <span>热门标签</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isTagsLoading ? (
                <div className="text-muted-foreground p-4 text-center text-sm">Loading tags...</div>
              ) : popularTags.length === 0 ? (
                <div className="text-muted-foreground p-4 text-center text-sm">
                  No popular tags available.
                </div>
              ) : (
                <div className="space-y-2">
                  {popularTags.map((tag: Tag, index: number) => (
                    <div
                      key={tag.tagId}
                      className="group flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-white/5 hover:shadow"
                      onClick={() =>
                        void navigate({ to: '/tag/$tagId', params: { tagId: tag.tagId } })
                      }
                    >
                      <div className="bg-primary/20 text-primary group-hover:bg-primary/80 group-hover:text-background flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors">
                        {index + 1}
                      </div>
                      <span className="text-foreground group-hover:text-primary flex-1 truncate text-sm transition-colors">
                        {tag.tagName}
                      </span>
                      <div className="text-muted-foreground/40 group-hover:text-muted-foreground text-xs">
                        <MoveRight className="size-4" strokeWidth={3} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
