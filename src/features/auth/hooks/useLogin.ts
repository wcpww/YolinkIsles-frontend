import { useMutation } from '@tanstack/react-query';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { getUser } from '@/features/profile/api/getUser';
import { login, type LoginRequest } from '../api/login';
import { useAuthStore } from '../store/useAuthStore';

type LoginSearch = {
  from?: string;
  showAuthRequired?: string;
};

export const useLogin = () => {
  const navigate = useNavigate();
  const search = useSearch({ from: '/login' });
  const setAuth = useAuthStore((state) => state.setAuth);
  const setCurrentUserData = useAuthStore((state) => state.setCurrentUserData);

  return useMutation({
    mutationFn: (payload: LoginRequest) => login(payload),
    onSuccess: async (data) => {
      setAuth({ userId: data.userId, accessToken: data.accessToken });

      try {
        const userData = await getUser(data.userId);
        setCurrentUserData(userData);
      } catch (error) {
        console.error('Failed to fetch user profile after login:', error);
      }

      // 如果有 from 参数，导航到原页面；否则导航到首页
      const returnTo = search.from ? decodeURIComponent(search.from) : '/';
      navigate({ to: returnTo });
    },
  });
};
