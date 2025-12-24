import { api } from "./client";
import type { RecordDto, DashboardStatsDto } from "../../types/record";

export async function fetchMyRecords(userId: number) {
    const res = await api.get<RecordDto[]>("/api/records", {
        params: { userId },
    });
    return res.data;
}

export async function fetchDashboardStats(userId: number) {
    const res = await api.get<DashboardStatsDto>("/api/records/stats/dashboard", {
        params: { userId },
    });
    return res.data;
}
