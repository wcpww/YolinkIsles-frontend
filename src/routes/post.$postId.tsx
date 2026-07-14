import { createFileRoute } from '@tanstack/react-router';
import PostDetailPage from '@/features/post-detail/pages/PostDetailPage';

export const Route = createFileRoute('/post/$postId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { postId } = Route.useParams();
  return <PostDetailPage postId={postId} />;
}
