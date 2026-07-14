import axiosInstance from '@/api/axiosInstance';
import { useOssUpload } from '../hooks/useOssUpload';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

interface ExternalLink {
  platform: string;
  url: string;
}

export async function updateProfileInfo(data: {
  username?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  sexType?: string;
  location?: string;
  externalLinks?: ExternalLink[];
  avatarFile?: File;
  bannerFile?: File;
}) {
  const { avatarFile, bannerFile, ...backendFormData } = data;

  try {
    if (avatarFile) {
      const { key } = await useOssUpload(avatarFile, '/avatar')();
      backendFormData.avatarUrl = key;
      useAuthStore.getState().setCurrentUserData({
        ...useAuthStore.getState().currentUserData!,
        avatarUrl: key,
      });
    }
    if (bannerFile) {
      const { key } = await useOssUpload(bannerFile, '/banner')();
      backendFormData.bannerUrl = key;
      useAuthStore.getState().setCurrentUserData({
        ...useAuthStore.getState().currentUserData!,
        bannerUrl: key,
      });
    }
  } catch (error) {
    console.error('上传头像或banner失败:', error);
    throw error;
  }

  console.log('📤 发送 PATCH /me/profile_info 请求体:', JSON.stringify(backendFormData, null, 2));

  const response = await axiosInstance.patch('/me/profile_info', backendFormData);
  
  console.log('📥 PATCH /me/profile_info 响应:', response.data);
  
  return response.data;
}