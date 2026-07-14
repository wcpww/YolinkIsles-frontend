import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { getMe } from '../api/getUser';

export const useProfile = () => {
  const user = useAuthStore((state) => state.currentUserData);
  const setCurrentUserData = useAuthStore((state) => state.setCurrentUserData);

  const { data: freshData } = useQuery({
    queryKey: ['me-profile'],
    queryFn: getMe,
    staleTime: 0,
    enabled: !!user,
  });

  useEffect(() => {
    if (freshData) {
      setCurrentUserData(freshData);
    }
  }, [freshData, setCurrentUserData]);

  return {
    data: user,
    isLoading: !user,
    error: user ? null : new Error('User not authenticated'),
  };
};
