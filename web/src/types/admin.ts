export interface Notice {
  id?: number;
  title: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminLoginRequest {
  password: string;
}

export interface AdminLoginResponse {
  message: string;
}
