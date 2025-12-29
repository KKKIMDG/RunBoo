export type GhostProfileDto = {
    id: number;
    userId: number;
    runRecordId: number;
    type: string;
    targetDistanceKm: number;
    avgPace: number; // 서버에서 Integer
    createdAt: string; // OffsetDateTime ISO 문자열
};