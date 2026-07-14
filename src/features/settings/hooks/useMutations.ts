import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { updateAuthInfo } from '../api/updateAuthInfo';
import { updateContact } from '../api/updateContact';
import { updatePassword } from '../api/updatePassword';
import { updateProfileInfo } from '../api/updateProfileInfo';

interface ExternalLink {
  platform: string;
  url: string;
}

interface UpdateProfilePayload {
  username?: string;
  bio?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  sexType?: string;
  location?: string;
  externalLinks?: ExternalLink[];
  avatarFile?: File;
  bannerFile?: File;
}

interface UpdateContactPayload {
  email?: string;
  phone?: string;
}

interface UpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

interface UpdateAuthPayload {
  realName?: string;
  studentId?: string;
}

/**
 * 更新个人资料的 mutation hook
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) => updateProfileInfo(data),
    onSuccess: (_response, variables) => {
      const currentUser = useAuthStore.getState().currentUserData;
      if (currentUser) {
        useAuthStore.getState().setCurrentUserData({
          ...currentUser,
          username: variables.username ?? currentUser.username,
          bio: variables.bio ?? currentUser.bio,
          sexType: variables.sexType ?? currentUser.sexType,
          location: variables.location ?? currentUser.location,
          externalLinks: variables.externalLinks ?? currentUser.externalLinks,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
};

/**
 * 更新联系方式的 mutation hook
 */
export const useUpdateContact = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateContactPayload) => updateContact(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
};

/**
 * 更新密码的 mutation hook
 */
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (data: UpdatePasswordPayload) => updatePassword(data),
  });
};

/**
 * 更新认证信息的 mutation hook
 */
export const useUpdateAuthInfo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAuthPayload) => updateAuthInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
    },
  });
};
