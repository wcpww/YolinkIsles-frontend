/**
 * 本地草稿文章
 * 用于 localStorage 存储，支持离线编辑和自动保存
 */
export interface DraftPost {
  /**
   * 唯一ID (使用时间戳或UUID区分多个草稿)
   */
  id: string;

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
   */
  contentJson: object;

  /**
   * 标签列表
   */
  tags: string[];

  /**
   * 文章头图 URL (Base64或本地URL)
   */
  heroUrl?: string;

  /**
   * 文章缩略图 URL (Base64或本地URL)
   */
  thumbnailUrl?: string;

  /**
   * 保存时间戳 (用于排序和管理多个草稿)
   */
  savedAt: number;
}
