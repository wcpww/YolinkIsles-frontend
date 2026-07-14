import { useQuery } from '@tanstack/react-query';
import { CalendarDays, Megaphone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAnnouncementDetail } from '../api/getAnnouncementDetail';
import AnnouncementSkeleton from './AnnouncementSkeleton';

interface AnnouncementPageProps {
  announcementId: string;
}

export default function AnnouncementPage({ announcementId }: AnnouncementPageProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['announcement', announcementId],
    queryFn: () => getAnnouncementDetail(announcementId),
  });

  if (isLoading) return <AnnouncementSkeleton />;
  if (error || !data)
    return <div className="text-destructive p-4 text-center">Failed to load announcement.</div>;

  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
      <div className="flex items-center gap-2">
        <Megaphone className="text-primary h-6 w-6" />
        <h1 className="text-2xl font-bold">Announcement</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{data.title}</CardTitle>
          <div className="text-muted-foreground flex items-center gap-1 text-sm">
            <CalendarDays className="h-3.5 w-3.5" />
            {data.createdAt}
          </div>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none">
          <div className="whitespace-pre-wrap">{data.contentMd}</div>
        </CardContent>
      </Card>
    </div>
  );
}
