import { useQuery } from '@tanstack/react-query';
import { getPostForEdit } from '../api/getPostForEdit';
import EditPostForm from '../components/EditPostForm';

interface EditPostPageProps {
  postId: string;
}

export default function EditPostPage({ postId }: EditPostPageProps) {
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['edit-post', postId],
    queryFn: () => getPostForEdit(postId),
  });

  if (isLoading) {
    return <div className="text-muted-foreground p-8 text-center">加载中...</div>;
  }

  if (error || !post) {
    return <div className="text-destructive p-8 text-center">加载失败，无法编辑此文章</div>;
  }

  return <EditPostForm post={post} />;
}
