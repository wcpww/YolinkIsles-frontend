import { createFileRoute } from '@tanstack/react-router';
import BookmarkPage from '@/features/bookmarks/page/BookmarkPage';

export const Route = createFileRoute('/bookmarks')({
  component: BookmarkPage,
});
