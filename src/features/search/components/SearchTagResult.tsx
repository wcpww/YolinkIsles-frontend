import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchTags } from '../hooks';
import TagFeedCard from './TagFeedCard';

interface SearchTagResultProps {
  keyword: string;
  type: string;
  onTypeChange: (type: string) => void;
}

export const SearchTagResult = ({ keyword, type, onTypeChange }: SearchTagResultProps) => {
  const { data: tags, isLoading } = useSearchTags(keyword, type, keyword.length > 0);

  // Valid type values for tag search
  const validTypes = ['numFollowers', 'numPosts'];
  const tabValue = validTypes.includes(type) ? type : 'numFollowers';

  return (
    <Tabs value={tabValue} onValueChange={onTypeChange} defaultValue="numFollowers">
      <TabsList>
        <TabsTrigger value="numFollowers">关注最多</TabsTrigger>
        <TabsTrigger value="numPosts">帖子最多</TabsTrigger>
      </TabsList>

      <TabsContent value={type} className="mt-4">
        {!keyword ? (
          <div className="text-muted-foreground py-16 text-center">Enter a keyword to search</div>
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-4">
                <Skeleton className="h-6 w-32" />
                <div className="mt-4 flex gap-6">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !tags || tags.length === 0 ? (
          <div className="text-muted-foreground py-16 text-center">
            No results found for "{keyword}"
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tags.map((tag) => (
              <TagFeedCard key={tag.tagId} tag={tag} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
