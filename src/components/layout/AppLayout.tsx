// src/components/layout/AppLayout.tsx

import { ThemeProvider } from '../theme/ThemeProvider';
import { SidebarProvider } from '../ui/sidebar';
import { TooltipProvider } from '../ui/tooltip';
import { AppNavbar } from './AppNavbar';
import { AppSidebar } from './AppSidebar';

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <AppNavbar />

        <SidebarProvider>
          <AppSidebar />
          <div className="mt-14 w-full">{children}</div>
        </SidebarProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
