// src/api/axiosInstance.ts

import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const REFRESH_ENDPOINT = '/refresh';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
  }
}

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL as string,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const getAccessToken = () => useAuthStore.getState().accessToken;

const clearAuthAndRedirect = () => {
  useAuthStore.getState().clearAuth();
  window.location.assign('/login');
};

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const response = await axiosInstance.post(REFRESH_ENDPOINT, null, {
    skipAuthRefresh: true,
    withCredentials: true,
  });

  const newToken = response.data?.data?.accessToken ?? response.data?.accessToken ?? null;

  if (newToken) {
    useAuthStore.getState().setAccessToken(newToken);
  }

  return newToken;
};

const getRefreshPromise = () => {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
      .catch((error) => {
        clearAuthAndRedirect();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = getAccessToken();
  // console.log('🔍 拦截器执行 - URL:', config.url);
  // console.log('📌 skipAuthRefresh:', config.skipAuthRefresh);
  // console.log('🔑 当前 accessToken:', accessToken);

  if (!config.skipAuthRefresh) {
    if (accessToken) {
      config.headers = config.headers ?? {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        // console.log('✅ 已添加 Authorization 标头:', config.headers.Authorization);
      }
    } else {
      console.warn('⚠️ 没有 accessToken，无法添加 Authorization 标头');
    }
  } else {
    console.log('⏭️ 跳过 Authorization（skipAuthRefresh=true）');
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const config = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
          skipAuthRefresh?: boolean;
        })
      | undefined;

    if (status === 401 && config && !config._retry && !config.skipAuthRefresh) {
      config._retry = true;

      try {
        const newToken = await getRefreshPromise();
        if (newToken) {
          config.headers = config.headers ?? {};
          config.headers.Authorization = `Bearer ${newToken}`;
        }

        return axiosInstance(config);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
