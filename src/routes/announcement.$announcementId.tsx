import { createFileRoute } from '@tanstack/react-router';
import AnnouncementPage from '@/features/announcement/components/AnnouncementPage';

export const Route = createFileRoute('/announcement/$announcementId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { announcementId } = Route.useParams();
  return <AnnouncementPage announcementId={announcementId} />;
}
