import type { Notice } from "../types/admin";

// 개발환경에서는 프록시 사용, 프로덕션에서는 절대 URL 사용
const API_BASE_URL =
  import.meta.env.MODE === "development"
    ? "/api/admin" // 프록시를 통해 요청
    : `${import.meta.env.VITE_API_BASE_URL}/api/admin`;

console.log("API_BASE_URL:", API_BASE_URL); // 디버깅용
console.log("MODE:", import.meta.env.MODE); // 디버깅용

export const adminApi = {
  // 관리자 로그인
  login: async (password: string): Promise<string> => {
    const url = `${API_BASE_URL}/login`;
    console.log("Attempting login to:", url);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
        credentials: "include", // 세션 쿠키를 포함하기 위해 필요
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "로그인에 실패했습니다.");
      }

      return response.text();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // 관리자 로그아웃
  logout: async (): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("로그아웃에 실패했습니다.");
    }

    return response.text();
  },

  // 모든 공지사항 조회
  getAllNotices: async (): Promise<Notice[]> => {
    const response = await fetch(`${API_BASE_URL}/notices`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("공지사항을 불러오는데 실패했습니다.");
    }

    return response.json();
  },

  // 공지사항 생성
  createNotice: async (notice: Notice): Promise<Notice> => {
    const response = await fetch(`${API_BASE_URL}/notices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notice),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("공지사항 생성에 실패했습니다.");
    }

    return response.json();
  },

  // 공지사항 수정
  updateNotice: async (id: number, notice: Notice): Promise<Notice> => {
    const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notice),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("공지사항 수정에 실패했습니다.");
    }

    return response.json();
  },

  // 공지사항 삭제
  deleteNotice: async (id: number): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("공지사항 삭제에 실패했습니다.");
    }

    return response.text();
  },

  // 세션 확인 (인증 체크)
  checkAuth: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/notices`, {
        method: "GET",
        credentials: "include",
      });

      return response.ok;
    } catch {
      return false;
    }
  },
};
