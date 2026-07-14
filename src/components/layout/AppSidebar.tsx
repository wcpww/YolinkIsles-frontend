// src/components/layout/AppSidebar.tsx

import {
  Bell,
  Bookmark,
  BookmarkPlus,
  Bot,
  Clock,
  Home,
  LifeBuoy,
  Send,
  SquareTerminal,
} from 'lucide-react';
import { Sidebar, SidebarContent, SidebarRail, SidebarSeparator } from '@/components/ui/sidebar';
import { NavAuthor } from './NavAuthor';
import { NavMain } from './NavMain';
import { NavSecondary } from './NavSecondary';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navAuthor: [
    {
      title: '个人主页',
      url: '/me',
      icon: SquareTerminal,
    },
    {
      title: '设置',
      url: '/settings',
      icon: Bot,
    },
  ],
  navSecondary: [
    {
      title: '遇到Bug?',
      url: '#',
      icon: LifeBuoy,
    },
    {
      title: '提点建议!',
      url: '#',
      icon: Send,
    },
  ],
  navMain: [
    {
      name: '主页',
      url: '/',
      icon: Home,
    },
    {
      name: '通知',
      url: '/notifications',
      icon: Bell,
    },
    {
      name: '收藏',
      url: '/bookmarks',
      icon: Bookmark,
    },
    {
      name: '最近浏览',
      url: '/history',
      icon: Clock,
    },
    {
      name: '发布',
      url: '/create-post',
      icon: BookmarkPlus,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarContent className="mt-14">
        <NavMain items={data.navMain} />
        <SidebarSeparator />
        <NavAuthor items={data.navAuthor} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>

      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
