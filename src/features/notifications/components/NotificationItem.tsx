import { AtSign, Bell, Heart, MessageCircle, UserPlus } from 'lucide-react';
import type { Notification } from '@/features/profile/types';

interface NotificationItemProps {
  notification: Notification;
}

const iconMap: Record<Notification['type'], typeof Bell> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  mention: AtSign,
};

export function NotificationItem({ notification }: NotificationItemProps) {
  const Icon = iconMap[notification.type] ?? Bell;

  return (
    <div
      className={`flex items-start gap-3 rounded-lg p-3 transition-colors ${
        notification.isRead ? 'opacity-60' : 'bg-muted/50'
      }`}
    >
      <div className="bg-primary/10 text-primary flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm">{notification.message}</p>
        <span className="text-muted-foreground text-xs">{notification.createdAt}</span>
      </div>
      {!notification.isRead && (
        <span className="bg-primary mt-1 h-2 w-2 flex-shrink-0 rounded-full" />
      )}
    </div>
  );
}
