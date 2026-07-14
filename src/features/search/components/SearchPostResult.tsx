import { PostCardSkeleton } from '@/components/post-card-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchPosts } from '../hooks';
import PostFeedCard from './PostFeedCard';

interface SearchPostResultProps {
  keyword: string;
  type: string;
  onTypeChange: (type: string) => void;
}

export const SearchPostResult = ({ keyword, type, onTypeChange }: SearchPostResultProps) => {
  const { data: posts, isLoading } = useSearchPosts(keyword, type, keyword.length > 0);

  return (
    <Tabs value={type} onValueChange={onTypeChange}>
      <TabsList>
        <TabsTrigger value="relevance">综合</TabsTrigger>
        <TabsTrigger value="hot">最热</TabsTrigger>
        <TabsTrigger value="new">最新</TabsTrigger>
      </TabsList>

      <TabsContent value={type} className="mt-4 space-y-4">
        {!keyword ? (
          <div className="text-muted-foreground py-16 text-center">Enter a keyword to search</div>
        ) : isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <PostCardSkeleton key={i} />)
        ) : !posts || posts.length === 0 ? (
          <div className="text-muted-foreground py-16 text-center">
            No results found for "{keyword}"
          </div>
        ) : (
          posts.map((post) => <PostFeedCard key={post.id} post={post} />)
        )}
      </TabsContent>
    </Tabs>
  );
};
