import axiosInstance from '@/api/axiosInstance';
import type { CreatePostRequest } from '../types';

/**
 * 创建新文章
 *
 * @param data - 创建文章的请求体，包含标题、描述、内容等
 * @returns 创建成功后返回的响应数据（包含文章ID等）
 *
 * @endpoint POST /post
 * @description
 * 向服务器发送新文章数据，服务器会验证内容并保存
 * contentJson 应为 TipTap 编辑器的 JSON 输出，通过 editor.getJSON() 获得
 *
 * @example
 * ```typescript
 * const response = await createPost({
 *   title: "我的第一篇文章",
 *   description: "这是文章的简短描述",
 *   contentJson: {
 *     type: "doc",
 *     content: [...]
 *   },
 *   tags: ["frontend", "react"],
 *   heroUrl: "https://example.com/hero.jpg", // 可选
 *   thumbnailUrl: "https://example.com/thumbnail.jpg" // 可选
 * });
 * ```
 *
 * @throws 如果请求失败，将抛出 axios 错误
 */
export async function createPost(data: CreatePostRequest) {
  const response = await axiosInstance.post('/create-post', { data });
  return response.data;
}
