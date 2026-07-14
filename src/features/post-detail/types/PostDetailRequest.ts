/**
 * Request
 */
import type { PostDetailData } from './PostDetailData';

export interface PostDetailRequest {
  code: number;
  data: Data;
  message: string;
}

export interface Data {
  post: PostDetailData;
}
