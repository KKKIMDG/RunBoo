// services/auth/authService.ts

import { api } from '../api';

/** 로그인 요청 DTO */
export interface LoginRequest {
  email: string;
  password: string;
}

/** 로그인 응답 DTO */
export interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: number;
    email: string;
    nickname: string;
  };
}

/** 이메일 로그인 */
export const AuthService = {
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginRequest>('/api/auth/login', data);
  },
};