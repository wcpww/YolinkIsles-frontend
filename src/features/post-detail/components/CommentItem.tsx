import { Heart, MessageSquare, Copy, MoreVertical, TriangleAlert, Send } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getSrcPath, OSS_STYLE_PARAMETERS } from '@/components/api/oss/ossPathAssembler';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { cn } from '@/lib/utils';
import { reportComment } from '../api/reportComment';
import { toggleCommentLike } from '../api/toggleCommentLike';
import { useCreateComment } from '../hooks/useCreateComment';
import { CommentStatus } from '../types/Comment';
import AuthorHoverCard from './AuthorHoverCard';
import type { Comment } from '../types/Comment';

interface CommentItemProps {
  comment: Comment;
}

function parseDate(dateString: string): string {
  try {
    let date = new Date(dateString);
    if (isNaN(date.getTime())) {
      date = new Date(dateString.replace(' ', 'T'));
    }
    if (isNaN(date.getTime())) return dateString;

    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return '刚刚';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}天前`;

    const sameYear = date.getFullYear() === new Date().getFullYear();
    return date.toLocaleDateString('zh-CN', {
      year: sameYear ? undefined : 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function CommentItem({ comment }: CommentItemProps) {
  const numFormatter = new Intl.NumberFormat('zh-CN', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  const children = useMemo(() => comment.children ?? [], [comment.children]);

  const totalDescendants = useMemo(() => {
    function count(items: Comment[]): number {
      return items.reduce((acc, c) => acc + 1 + count(c.children ?? []), 0);
    }
    return count(children);
  }, [children]);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(comment.level >= 2);
  const [isThreadHovered, setIsThreadHovered] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [isLiked, setIsLiked] = useState<boolean>(!!comment.isLikedByUser);
  const [likes, setLikes] = useState(comment.likes ?? 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const userId = useAuthStore((state) => state.userId);
  const { mutate: submitReply, isPending: isSubmitting } = useCreateComment(comment.postId);

  const handleReplyToggle = () => {
    setIsReplying((prev) => {
      if (!prev) {
        setTimeout(() => textareaRef.current?.focus(), 0);
      }
      return !prev;
    });
    setReplyContent('');
  };

  const handleSubmitReply = () => {
    if (!replyContent.trim() || !userId) return;
    submitReply(
      {
        postId: comment.postId,
        rootId: comment.commentId,
        userId,
        content: replyContent.trim(),
      },
      {
        onSuccess: () => {
          setIsReplying(false);
          setReplyContent('');
        },
      },
    );
  };

  const handleLike = async () => {
    if (isLiking) return;
    const prevLiked = isLiked;
    const prevLikes = likes;

    setIsLiking(true);
    setIsLiked(!prevLiked);
    setLikes(prevLiked ? prevLikes - 1 : prevLikes + 1);

    try {
      const result = await toggleCommentLike(comment.commentId);
      setIsLiked(result.isLiked);
      setLikes(result.likes);
    } catch {
      setIsLiked(prevLiked);
      setLikes(prevLikes);
      toast.error('操作失败，请重试');
    } finally {
      setIsLiking(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(comment.content);
      toast.success('已复制到剪贴板');
    } catch {
      toast.error('复制失败');
    }
  };

  const handleReport = async () => {
    if (isReporting) return;
    setIsReporting(true);
    try {
      await reportComment(comment.commentId);
      toast.success('举报已提交，感谢你的反馈');
    } catch {
      toast.error('举报失败，请重试');
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Current comment */}
      <div
        className={cn(
          'hover:bg-muted/50 group/comment flex rounded-lg pt-2 pl-2 transition-colors duration-300',
          isMenuOpen && 'bg-muted/50',
        )}
      >
        {/* Left column: avatar & vertical line */}
        <div className="flex w-8 shrink-0 flex-col gap-1">
          <Avatar size="default" className="shrink-0 cursor-pointer">
            <AvatarImage
              src={getSrcPath(comment.avatarUrl, OSS_STYLE_PARAMETERS.AVATAR)}
              alt={comment.username}
            />
            <AvatarFallback>{comment.username.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>

          {children.length > 0 && (
            <button
              onClick={() => {
                setIsCollapsed((prev) => !prev);
                setIsThreadHovered(false);
              }}
              onMouseEnter={() => setIsThreadHovered(true)}
              onMouseLeave={() => setIsThreadHovered(false)}
              className="flex flex-1 cursor-pointer flex-col focus:outline-none focus-visible:outline-none"
              aria-label={isCollapsed ? `展开 ${children.length} 条评论` : '折叠评论'}
              title={isCollapsed ? `展开 ${children.length} 条评论` : '折叠评论'}
            >
              <span
                className={cn(
                  'ml-4 w-0.5 flex-1 transition-colors duration-200',
                  isThreadHovered ? 'bg-primary' : 'bg-border',
                )}
              />
            </button>
          )}
        </div>

        {/* Right column: main content */}
        <div className="flex-1 pb-2 pl-2">
          {/* Username and timestamp */}
          <div className="mb-1 flex items-center gap-2">
            <AuthorHoverCard authorId={comment.userId}>
              <span className="text-sm font-semibold">{comment.username}</span>
            </AuthorHoverCard>

            <span className="text-muted-foreground/50">•</span>

            <span className="text-muted-foreground text-sm">{parseDate(comment.createdAt)}</span>
          </div>

          {/* Comment content */}
          {comment.status === CommentStatus.Deleted ? (
            <div className="text-muted-foreground bg-muted/50 rounded p-2 text-base italic">
              已被删除
            </div>
          ) : comment.status === CommentStatus.Banned ? (
            <div className="text-muted-foreground bg-muted/50 rounded p-2 text-base italic">
              已被封禁
            </div>
          ) : (
            <div className="text-foreground text-base whitespace-pre-wrap">{comment.content}</div>
          )}

          {/* Actions */}
          {comment.status === CommentStatus.Normal && (
            <div className="mt-1 flex items-center gap-1">
              <Button
                variant="ghost"
                className={cn('cursor-pointer gap-1 py-4', isLiked ? 'text-red-500' : '')}
                onClick={() => void handleLike()}
                disabled={isLiking}
              >
                <Heart className={cn('size-4.5', isLiked ? 'fill-current' : '')} />
                <span>{numFormatter.format(likes)}</span>
              </Button>

              <Button
                variant="ghost"
                className={cn('cursor-pointer gap-1 py-4', isReplying && 'text-primary')}
                onClick={handleReplyToggle}
              >
                <MessageSquare className="size-4.5" />
                <span>{numFormatter.format(comment.children?.length || 0)}</span>
              </Button>
            </div>
          )}

          {/* Reply input */}
          {isReplying && (
            <div className="mt-2 mb-2 flex flex-col gap-2">
              <Textarea
                ref={textareaRef}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`回复 @${comment.username}...`}
                className="min-h-20 resize-none text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSubmitReply();
                  }
                  if (e.key === 'Escape') {
                    handleReplyToggle();
                  }
                }}
              />
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer"
                  onClick={handleReplyToggle}
                  disabled={isSubmitting}
                >
                  取消
                </Button>
                <Button
                  size="sm"
                  className="cursor-pointer gap-1"
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  <Send className="size-3.5" />
                  <span>回复</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* More actions — revealed on hover */}
        <div
          className={`flex shrink-0 items-start pr-2 transition-opacity group-hover/comment:opacity-100 ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground size-8 cursor-pointer rounded-full"
              >
                <MoreVertical className="size-4.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-25">
              <DropdownMenuItem className="cursor-pointer" onClick={() => void handleCopy()}>
                <Copy className="mr-2 size-4.5" />
                <span className="tracking-widest">复制</span>
              </DropdownMenuItem>
              <Separator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                disabled={isReporting}
                onClick={() => void handleReport()}
              >
                <TriangleAlert className="mr-2 size-4.5" />
                <span className="tracking-widest">举报</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Recursive child comments */}
      {children.length > 0 &&
        (isCollapsed ? (
          <div className="relative mb-2 ml-8">
            {/* Arc connecting to the expand button */}
            <div
              aria-hidden="true"
              className={cn(
                'pointer-events-none absolute -top-2 -left-2 size-6 rounded-bl-2xl border-b-2 border-l-2 transition-colors duration-200',
                isThreadHovered ? 'border-primary' : 'border-border',
              )}
            />

            <Button
              onClick={() => setIsCollapsed(false)}
              variant="ghost"
              className="hover:text-foreground text-muted-foreground -mt-1 ml-4 cursor-pointer p-2 tracking-wider"
            >
              <span>点击展开 {totalDescendants} 条评论</span>
            </Button>
          </div>
        ) : (
          <div className="ml-8 flex flex-col">
            {children.map((child, index) => {
              const isChildLast = index === children.length - 1;

              return (
                <div key={child.commentId} className="relative">
                  {/* Vertical line connecting to child comments */}
                  {!isChildLast && (
                    <button
                      onClick={() => {
                        setIsCollapsed((prev) => !prev);
                        setIsThreadHovered(false);
                      }}
                      onMouseEnter={() => setIsThreadHovered(true)}
                      onMouseLeave={() => setIsThreadHovered(false)}
                      tabIndex={-1}
                      aria-label="折叠评论"
                      className="absolute top-0 bottom-0 -left-4 flex w-4 cursor-pointer items-center justify-start pl-2 focus:outline-none focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          'h-full w-0.5 transition-colors duration-200',
                          isThreadHovered ? 'bg-primary' : 'bg-border',
                        )}
                      />
                    </button>
                  )}

                  {/* Arc connecting to the avatar */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      'pointer-events-none absolute top-0 -left-2 size-6 rounded-bl-2xl border-b-2 border-l-2 transition-colors duration-200',
                      isThreadHovered ? 'border-primary' : 'border-border',
                    )}
                  />

                  {/* Recursive rendering of child comments */}
                  <CommentItem comment={child} />
                </div>
              );
            })}
          </div>
        ))}
    </div>
  );
}
