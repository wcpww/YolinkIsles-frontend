import { createFileRoute } from '@tanstack/react-router';
import EditPostPage from '@/features/edit-post/pages/EditPostPage';

export const Route = createFileRoute('/edit-post/$postId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return <EditPostPage postId={postId} />;
}
