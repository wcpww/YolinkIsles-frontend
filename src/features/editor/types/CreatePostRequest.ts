/**
 * 创建文章请求体
 * 用于向 POST /post 端点发送的数据结构
 */
export interface CreatePostRequest {
  /**
   * 文章标题
   */
  title: string;

  /**
   * 文章描述/摘要
   */
  description: string;

  /**
   * 文章内容 (TipTap JSON格式)
   * 由 TipTap 编辑器的 getJSON() 方法生成
   */
  contentJson: object;

  /**
   * 文章内容 (Markdown格式, 可选)
   */
  contentMd?: string;

  /**
   * 标签列表 (标签名称数组)
   * 例如: ["frontend", "react", "typescript"]
   */
  tags: string[];

  /**
   * 文章头图 URL (可选)
   * 用于文章详情页顶部展示
   */
  heroUrl?: string;

  /**
   * 文章缩略图 URL (可选)
   * 用于文章列表卡片等场景
   */
  thumbnailUrl?: string;
}
