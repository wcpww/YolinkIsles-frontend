import { createFileRoute } from '@tanstack/react-router';
import { useEffect } from 'react';
import { toast } from 'sonner';
import LoginPage from '@/features/auth/components/LoginPage';

type LoginSearch = {
  from?: string;
  showAuthRequired?: string;
};

export const Route = createFileRoute('/login')({
  validateSearch: (search: Record<string, unknown>): LoginSearch => {
    return {
      from: typeof search.from === 'string' ? search.from : undefined,
      showAuthRequired:
        typeof search.showAuthRequired === 'string' ? search.showAuthRequired : undefined,
    };
  },
  component: LoginRouteComponent,
});

function LoginRouteComponent() {
  const search = Route.useSearch();

  useEffect(() => {
    if (search.showAuthRequired === 'true') {
      toast.error('请先登录', {
        description: '访问此页面需要登录',
        duration: 1000,
      });
    }
  }, [search.showAuthRequired]);

  return <LoginPage />;
}
