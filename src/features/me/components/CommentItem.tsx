import { Link } from '@tanstack/react-router';
import { Heart, MessageCircle, Reply } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Comment } from '../types/Comment';

interface CommentItemProps {
  comment: Comment;
  className?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function CommentItem({ comment, className }: CommentItemProps) {
  const isBanned = comment.status === 'banned';
  const isDeleted = comment.status === 'deleted';
  const isReply = comment.parentContent !== null;

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border p-4 transition-colors hover:bg-white/5',
        className,
      )}
    >
      {/* 回复引用 */}
      {isReply && (
        <div className="flex items-start gap-1.5">
          <Reply className="text-muted-foreground mt-0.5 size-3.5 shrink-0 rotate-180" />
          <p className="text-muted-foreground line-clamp-2 text-xs">
            回复：{comment.parentContent}
          </p>
        </div>
      )}

      {/* 评论内容 */}
      <p
        className={cn(
          'text-sm leading-relaxed',
          (isDeleted || isBanned) && 'text-muted-foreground italic',
        )}
      >
        {isDeleted ? '该评论已被删除' : isBanned ? '该评论已被封禁' : comment.content}
      </p>

      {/* 所属帖子 */}
      <Link
        to="/post/$postId"
        params={{ postId: comment.postId }}
        className="text-primary line-clamp-1 self-start text-sm font-medium hover:underline"
      >
        {comment.postTitle}
      </Link>

      {/* 底部信息：时间、回复标识、点赞 */}
      <div className="text-muted-foreground flex items-center gap-3 text-xs">
        <span>{formatDate(comment.createdAt)}</span>
        {isReply && <span className="bg-muted rounded px-1.5 py-0.5 text-xs">回复</span>}
        <span className="ml-auto inline-flex items-center gap-1">
          <Heart className="size-3" />
          {comment.likes}
        </span>
      </div>
    </div>
  );
}

export default CommentItem;
