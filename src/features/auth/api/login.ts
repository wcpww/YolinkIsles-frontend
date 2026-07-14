import axios from 'axios';

export type LoginRequest = {
  username: string | null;
  email: string | null;
  phone: string | null;
  password: string;
};

type LoginResponse = {
  code: number;
  message: string;
  data: {
    userId: string;
    accessToken: string;
  };
};

const authAxios = axios.create({
  baseURL: import.meta.env.VITE_API_AUTH_BASE_URL as string,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const login = async (payload: LoginRequest): Promise<LoginResponse['data']> => {
  // Clean null fields from payload to match API expectations
  const cleanPayload = Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== null),
  );

  const response = await authAxios.post<LoginResponse>('/login', cleanPayload);

  if (response.data.code !== 0 || !response.data.data?.accessToken) {
    throw new Error(response.data.message || 'Login failed');
  }

  return response.data.data;
};
