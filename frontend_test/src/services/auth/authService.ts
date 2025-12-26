// services/auth/authService.ts

import { api } from '@/services/api';

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

/** 회원가입 요청 DTO */
export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

/** 이메일 인증 코드 요청 DTO */
export interface EmailVerifyRequest {
  email: string;
  code: string;
}

/** Auth 관련 API 모음 */
export const AuthService = {

  /** 이메일 로그인 */
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return api.post<LoginRequest>('/api/auth/login', data);
  },

  /**
   * 이메일 인증 코드 발송
   */
  sendEmailCode: (email: string): Promise<void> => {
    return api.post('/api/auth/email/verify', { email });
  },

  /**
   * 이메일 인증 코드 검증
   */
  verifyEmailCode: (email: string, code: string): Promise<void> => {
    return api.post<EmailVerifyRequest>('/api/auth/email/verify/check', {
      email,
      code,
    });
  },

  /**
   * 회원가입
   * - 이메일 인증이 완료된 사용자만 가능
   */
  signup: (data: SignupRequest): Promise<void> => {
    return api.post<SignupRequest>('/api/auth/signup', data);
  },
};