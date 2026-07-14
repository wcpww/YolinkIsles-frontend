import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Notification } from '@/features/profile/types';
import { NotificationItem } from './NotificationItem';

// Mock data until API is wired
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    actorName: 'Alice',
    actorAvatarUrl: '',
    message: 'Alice liked your post "Getting Started with React"',
    postTitle: 'Getting Started with React',
    isRead: false,
    createdAt: '2024-01-15 10:30',
  },
  {
    id: '2',
    type: 'comment',
    actorName: 'Bob',
    actorAvatarUrl: '',
    message: 'Bob commented on your post',
    isRead: false,
    createdAt: '2024-01-15 09:00',
  },
  {
    id: '3',
    type: 'follow',
    actorName: 'Charlie',
    actorAvatarUrl: '',
    message: 'Charlie started following you',
    isRead: true,
    createdAt: '2024-01-14 17:45',
  },
  {
    id: '4',
    type: 'mention',
    actorName: 'System',
    actorAvatarUrl: '',
    message: 'Welcome to Yolink! Complete your profile to get started.',
    isRead: true,
    createdAt: '2024-01-14 12:00',
  },
];

export default function NotificationsPage() {
  const allNotifications = mockNotifications;
  const unread = allNotifications.filter((n) => !n.isRead);

  return (
    <div className="animate-in fade-in mx-auto flex w-full max-w-6xl flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Bell className="h-6 w-6" />
          Notifications
        </h1>
        <Button variant="ghost" size="sm">
          Mark all as read
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">全部</TabsTrigger>
          <TabsTrigger value="unread">未读 {unread.length > 0 && `(${unread.length})`}</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardContent className="divide-y p-0">
              {allNotifications.length === 0 ? (
                <div className="text-muted-foreground py-16 text-center text-sm">
                  No notifications yet.
                </div>
              ) : (
                allNotifications.map((n) => <NotificationItem key={n.id} notification={n} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unread">
          <Card>
            <CardContent className="divide-y p-0">
              {unread.length === 0 ? (
                <div className="text-muted-foreground py-16 text-center text-sm">
                  All caught up!
                </div>
              ) : (
                unread.map((n) => <NotificationItem key={n.id} notification={n} />)
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
