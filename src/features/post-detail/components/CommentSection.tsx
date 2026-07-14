import { Send } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useCreateComment } from '../hooks/useCreateComment';
import { CommentItem } from './CommentItem';
import type { Comment } from '../types/Comment';

interface CommentSectionProps {
  postId: string;
  numComments: number;
  comments: Comment[];
  isLoading?: boolean;
}

export function CommentSection({
  postId,
  numComments,
  comments,
  isLoading = false,
}: CommentSectionProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userId = useAuthStore((state) => state.userId);
  const { mutate: submitComment, isPending } = useCreateComment(postId);

  const handleSubmit = () => {
    if (!content.trim() || !userId) return;
    submitComment(
      { postId, rootId: '', userId, content: content.trim() },
      {
        onSuccess: () => {
          setContent('');
          toast.success('评论已发布');
        },
        onError: () => {
          toast.error('评论失败，请重试');
        },
      },
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">评论 ({numComments})</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {/* 发表评论输入框 */}
        <div className="flex flex-col gap-2">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下你的评论..."
            className="min-h-24 resize-none text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          <div className="flex items-center justify-end">
            <Button
              size="sm"
              className="cursor-pointer gap-1"
              onClick={handleSubmit}
              disabled={!content.trim() || isPending}
            >
              <Send className="size-3.5" />
              <span>{isPending ? '发布中...' : '发布评论'}</span>
            </Button>
          </div>
        </div>

        {/* 评论列表 */}
        {isLoading ? (
          <div className="text-muted-foreground flex h-20 items-center justify-center">
            加载评论中...
          </div>
        ) : !comments || comments.length === 0 ? (
          <div className="text-muted-foreground flex h-20 items-center justify-center">
            暂无评论
          </div>
        ) : (
          <div className="flex flex-col">
            {comments.map((comment) => (
              <CommentItem key={comment.commentId} comment={comment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
