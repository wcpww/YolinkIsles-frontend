import type { Author } from './Author';
import type { Interactions } from './Interactions';
import type { Meta } from './Meta';
import type { Stats } from './Stats';
import type { Tag } from './Tag';

export interface PostDetailData {
  /**
   * 作者基本信息
   */
  author: Author;
  /**
   * 内容（JSON）
   */
  contentJson: object;
  /**
   * 内容（Markdown）
   */
  contentMd: string;
  /**
   * 简介
   */
  description: string;
  /**
   * 高清晰度：Hero card 背景图片的 URL
   */
  heroUrl: string | null;
  /**
   * ID
   */
  id: string;
  /**
   * 互动数据
   */
  interactions: Interactions;
  /**
   * 元数据
   */
  meta: Meta;
  /**
   * 统计数据
   */
  stats: Stats;
  /**
   * 标签列表，标签（话题）
   */
  tags: Tag[];
  /**
   * 低清晰度：列表中缩略图的 Url
   */
  thumbnailUrl?: string;
  /**
   * 标题
   */
  title: string;
}
