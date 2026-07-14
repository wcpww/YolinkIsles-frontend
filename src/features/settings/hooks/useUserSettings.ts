import { useAuthStore } from '@/features/auth/store/useAuthStore';

/**
 * 获取当前用户设置信息的 hook
 */
export const useUserSettings = () => {
  // return useQuery({
  //   queryKey: ['user-settings'],
  //   queryFn: () => getUser(),
  // });
  const user = useAuthStore((state) => state.currentUserData);
  return {
    data: user,
    isLoading: user ? false : true,
    error: user ? null : new Error('User not authenticated'),
  };
};
