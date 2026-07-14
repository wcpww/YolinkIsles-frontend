import { createFileRoute } from '@tanstack/react-router';
import CreatePostPage from '@/features/editor/pages/CreatePostPage';

export const Route = createFileRoute('/create-post')({
  validateSearch: (search: Record<string, unknown>) => ({
    draftId: (search.draftId as string) || undefined,
  }),
  component: CreatePostPage,
});
