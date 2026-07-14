/**
 * 元数据
 */
export interface Meta {
  /**
   * 创建时间
   */
  createdAt: string;
  /**
   * 是否被选为精选内容
   */
  isHero: boolean;
  /**
   * 是否被作者置顶
   */
  isPinnedByAuthor: boolean;
  /**
   * 最后修改时间
   */
  updatedAt: string;
}
