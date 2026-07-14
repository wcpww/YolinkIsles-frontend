import { createFileRoute } from '@tanstack/react-router';
import HistoryPage from '@/features/history/page/HistoryPage';

export const Route = createFileRoute('/history')({
  component: HistoryPage,
});
