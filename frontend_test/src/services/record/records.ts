import AsyncStorage from "@react-native-async-storage/async-storage";
import { api, setAccessToken } from "@/services/api";
import type { RecordDto, DashboardStatsDto } from "@/types/record";

/**
 * ✅ api.ts는 메모리 accessToken이 있어야 Authorization이 붙는다.
 * 그래서 "요청 직전에" AsyncStorage에서 accessToken을 읽어서 매번 setAccessToken을 보장한다.
 * (한 번만 로드하는 방식보다 이게 가장 안정적임)
 */
async function syncAccessTokenForRequest() {
    const raw = await AsyncStorage.getItem("accessToken"); // ✅ accessToken 키만 사용
    if (!raw) {
        setAccessToken(null);
        console.log("🔐 syncAccessTokenForRequest token exists = false");
        return;
    }

    // ✅ 혹시 "Bearer xxx"로 저장돼 있으면 중복 방지
    const t = raw.trim();
    const normalized = t.toLowerCase().startsWith("bearer ") ? t.slice(7).trim() : t;

    setAccessToken(normalized);
    console.log("🔐 syncAccessTokenForRequest token exists = true");
}

/** 내 기록 목록 조회 */
export async function fetchMyRecords(userId: number): Promise<RecordDto[]> {
    await syncAccessTokenForRequest();
    console.log("✅ fetchMyRecords userId =", userId);

    const data = await api.get(`/api/records/user/${userId}`);
    return data as RecordDto[];
}

/** 대시보드 통계 조회 */
export async function fetchDashboardStats(userId: number): Promise<DashboardStatsDto> {
    await syncAccessTokenForRequest();
    console.log("✅ fetchDashboardStats userId =", userId);

    const data = await api.get(`/api/records/user/${userId}/dashboard`);
    return data as DashboardStatsDto;
}
