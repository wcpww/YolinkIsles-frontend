import { Outlet, createRootRoute, redirect, useRouterState } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const NO_LAYOUT_ROUTES = ['/login'];

// 不需要登录的路由
const PUBLIC_ROUTES = ['/', '/login'];

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const isLoggedIn = useAuthStore.getState().isLoggedIn;
    const pathname = location.pathname;

    // 如果路由需要登录但用户未登录
    if (!PUBLIC_ROUTES.includes(pathname) && !isLoggedIn) {
      throw redirect({
        to: '/login',
        search: {
          from: location.href,
          showAuthRequired: 'true',
        },
      });
    }
  },
  component: RootComponent,
});

function RootComponent() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  if (NO_LAYOUT_ROUTES.includes(pathname)) {
    return (
      <>
        <Outlet />
        <Toaster position="top-center" richColors />
      </>
    );
  }

  return (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <Toaster position="top-center" richColors />
    </>
  );
}
