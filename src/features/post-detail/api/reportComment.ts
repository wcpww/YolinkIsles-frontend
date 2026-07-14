import axiosInstance from '@/api/axiosInstance';

interface ReportCommentResponse {
  code: number;
  message: string;
}

export const reportComment = async (commentId: string): Promise<void> => {
  await axiosInstance.post<ReportCommentResponse>(`/comment/${commentId}/report`);
};
