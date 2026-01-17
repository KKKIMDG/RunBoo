import type { Notice } from "../types/admin";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/api/notices`
  : "http://localhost:8080/api/notices";

export const noticeApi = {
  // 모든 공지사항 조회 (공개)
  getAllNotices: async (): Promise<Notice[]> => {
    const response = await fetch(API_BASE_URL);

    if (!response.ok) {
      throw new Error("공지사항을 불러오는데 실패했습니다.");
    }

    return response.json();
  },

  // 특정 공지사항 조회 (공개)
  getNoticeById: async (id: number): Promise<Notice> => {
    const response = await fetch(`${API_BASE_URL}/${id}`);

    if (!response.ok) {
      throw new Error("공지사항을 불러오는데 실패했습니다.");
    }

    return response.json();
  },
};
