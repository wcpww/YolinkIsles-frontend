import { useSearch } from '@tanstack/react-router';
import CreatePostPageComponent from '../components/CreatePostPage';

/**
 * 发布文章页面容器
 * 处理路由参数和页面级逻辑
 */
export default function CreatePostPage() {
  // 从URL查询参数中读取 draftId（如果有）
  const search = useSearch({ from: '/create-post' });
  const draftId = (search as { draftId?: string }).draftId;

  return <CreatePostPageComponent draftId={draftId} />;
}
