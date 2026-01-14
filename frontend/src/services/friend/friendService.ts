import { api } from '@/services/api';

// ✅ 백엔드 UserDto와 일치하도록 타입 정의
export interface Friend {
    id: number;
    nickname: string;
    email: string;
    profileImageUrl?: string;
}

export const FriendService = {
    /**
     * ✅ 내 친구 목록 조회
     */
    getMyFriends: async (): Promise<Friend[]> => {
        const response = await api.get('/api/friends');
        // api.ts는 데이터를 바로 반환하므로 response를 그대로 리턴
        return response as Friend[];
    },

    /**
     * ✅ 유저 검색 (친구 추가용)
     * - 닉네임 또는 이메일로 검색
     * - GET /api/users/search?keyword=...
     */
    searchUsers: async (keyword: string): Promise<Friend[]> => {
        // api.get은 params 옵션을 받지 않으므로 URL에 쿼리 스트링을 직접 붙여야 합니다.
        if (!keyword) return [];
        const response = await api.get(`/api/users/search?keyword=${encodeURIComponent(keyword)}`);
        return response as Friend[];
    },

    /**
     * ✅ 나에게 온 친구 요청 목록 조회 (수락 대기 중인 요청)
     * - GET /api/friends/requests
     */
    getReceivedRequests: async (): Promise<Friend[]> => {
        const response = await api.get('/api/friends/requests');
        return response as Friend[];
    },

    /**
     * ✅ 친구 요청 보내기
     * - POST /api/friends/request/{receiverId}
     */
    requestFriend: async (receiverId: number) => {
        // api.post는 두 번째 인자(body)가 필수이므로 빈 객체 {}를 전달합니다.
        await api.post(`/api/friends/request/${receiverId}`, {});
    },

    /**
     * ✅ 친구 요청 수락
     * - POST /api/friends/accept/{friendshipId}
     */
    acceptFriend: async (friendshipId: number) => {
        // api.post는 두 번째 인자(body)가 필수이므로 빈 객체 {}를 전달합니다.
        await api.post(`/api/friends/accept/${friendshipId}`, {});
    },

    deleteFriend: async (friendId: number) => {
        await api.delete(`/api/friends/${friendId}`);
    }
};