import { MessageSquareMore } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useComments } from '../hooks/useComments';
import CommentItem from './CommentItem';

export function CommentSection() {
  const { comments, isLoading, isLoadingMore, hasMore, loadMore, error } = useComments(10);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareMore className="size-5" />
          我的评论
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 加载中 */}
        {isLoading && (
          <div className="text-muted-foreground py-8 text-center text-sm">加载中...</div>
        )}

        {/* 加载失败 */}
        {error && !isLoading && (
          <div className="flex flex-col items-center gap-3 py-8">
            <p className="text-muted-foreground text-sm">加载失败，请重试</p>
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              重试
            </Button>
          </div>
        )}

        {/* 空数据 */}
        {!isLoading && !error && comments.length === 0 && (
          <div className="text-muted-foreground py-8 text-center text-sm">暂无评论</div>
        )}

        {/* 评论列表 */}
        {!isLoading && !error && comments.length > 0 && (
          <div className="flex flex-col gap-3">
            {comments.map((comment) => (
              <CommentItem key={comment.commentId} comment={comment} />
            ))}

            {/* 底部分页按钮 */}
            <div className="flex justify-center pt-2">
              {hasMore ? (
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="px-8"
                >
                  {isLoadingMore ? '加载中...' : '加载更多'}
                </Button>
              ) : (
                <p className="text-muted-foreground text-xs">没有更多了</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default CommentSection;
