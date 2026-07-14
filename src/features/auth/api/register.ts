import axios from 'axios';

export type StudentVerifyRequest = {
  realName: string;
  studentId: string;
};

type StudentVerifyResponse = {
  code: number;
  message: string;
  data: Record<string, never>;
};

const authAxios = axios.create({
  baseURL: import.meta.env.VITE_API_AUTH_BASE_URL as string,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export const studentVerify = async (
  payload: StudentVerifyRequest,
): Promise<StudentVerifyResponse> => {
  const response = await authAxios.post<StudentVerifyResponse>('/student-verify', payload);

  if (response.data.code !== 0) {
    throw new Error(response.data.message || '学号验证失败');
  }

  return response.data;
};

export type RegisterRequest = {
  realName: string;
  studentId: string;
  username: string;
  avatarUrl?: string;
  sexType: 'male' | 'female' | 'other';
  bio?: string;
  email: string;
  phone?: string;
  password: string;
};

type RegisterResponse = {
  code: number;
  message: string;
  data: Record<string, unknown>;
};

export const registerUser = async (payload: RegisterRequest): Promise<RegisterResponse> => {
  const response = await authAxios.post<RegisterResponse>('/register', payload);

  if (response.data.code !== 0) {
    throw new Error(response.data.message || '注册失败');
  }

  return response.data;
};

type CheckUsernameResponse = {
  code: number;
  message: string;
  data?: Record<string, unknown>;
};

export const checkUsername = async (username: string): Promise<CheckUsernameResponse> => {
  // 加入request body以符合后端接口设计
  const response = await authAxios.post<CheckUsernameResponse>(
    `/check-username`,
    { username }
  );

  return response.data;
};
