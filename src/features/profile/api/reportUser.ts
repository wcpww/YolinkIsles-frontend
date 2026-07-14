/**
 * 建议 API 设计：
 * POST /user/{userId}/report
 * Response: { code: number, message: string }
 * 幂等，后端对同一用户的重复举报去重处理
 */

import axiosInstance from '@/api/axiosInstance';

export const reportUser = async (userId: string): Promise<void> => {
  await axiosInstance.post(`/user/${userId}/report`);
};
