import axiosInstance from '@/api/axiosInstance';
import type { AnnouncementDetailResponse } from '@/features/profile/types';

export async function getAnnouncementDetail(announcementId: string) {
  const response = await axiosInstance.get<AnnouncementDetailResponse>(
    `/announcement/${announcementId}`,
  );
  return response.data.data;
}
