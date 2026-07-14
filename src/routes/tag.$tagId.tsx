import { createFileRoute } from '@tanstack/react-router';
import TagPage from '@/features/tag/page/TagPage';

export const Route = createFileRoute('/tag/$tagId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { tagId } = Route.useParams();
  return <TagPage tagId={tagId} />;
}
