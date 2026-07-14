import { createFileRoute } from '@tanstack/react-router';
import ProfilePage from '@/features/profile/page/ProfilePage';

export const Route = createFileRoute('/profile/$profileId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { profileId } = Route.useParams();

  return (
    <div>
      <ProfilePage profileId={profileId} />
    </div>
  );
}
