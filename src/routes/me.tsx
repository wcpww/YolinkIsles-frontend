import { createFileRoute } from '@tanstack/react-router';
import ProfilePage from '@/features/me/page/ProfilePage';

export const Route = createFileRoute('/me')({
  component: RouteComponent,
});

function RouteComponent() {
  return <ProfilePage />;
}
