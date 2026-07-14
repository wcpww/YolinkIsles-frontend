import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchUsers } from '../hooks';
import UserFeedCard from './UserFeedCard';
import type { UserResult } from '../types';

interface SearchUserResultProps {
  keyword: string;
  type: string;
  onTypeChange: (type: string) => void;
}

export const SearchUserResult = ({ keyword, type, onTypeChange }: SearchUserResultProps) => {
  const { data: users, isLoading } = useSearchUsers(keyword, type, keyword.length > 0);

  // Valid type values for user search
  const validTypes = ['numFollowers', 'numLikes', 'numPosts'];
  const tabValue = validTypes.includes(type) ? type : 'numFollowers';

  return (
    <Tabs value={tabValue} onValueChange={onTypeChange} defaultValue="numFollowers">
      <TabsList>
        <TabsTrigger value="numFollowers">粉丝最多</TabsTrigger>
        <TabsTrigger value="numLikes">获赞最多</TabsTrigger>
        <TabsTrigger value="numPosts">发帖最多</TabsTrigger>
      </TabsList>

      <TabsContent value={type} className="mt-4">
        {!keyword ? (
          <div className="text-muted-foreground py-16 text-center">Enter a keyword to search</div>
        ) : isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-3 rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-12 w-12 flex-shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <div className="space-y-2">
                  <div className="flex gap-3">
                    <Skeleton className="h-5 flex-1" />
                    <Skeleton className="h-5 flex-1" />
                  </div>
                  <div className="flex gap-3">
                    <Skeleton className="h-5 flex-1" />
                    <Skeleton className="h-5 flex-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : !users || users.length === 0 ? (
          <div className="text-muted-foreground py-16 text-center">
            No results found for "{keyword}"
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
              <UserFeedCard key={user.id} user={user} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
