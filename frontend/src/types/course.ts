export interface Course {
    id: number;
    writerId: number;       // 추가됨
    name: string;
    description: string;    // 추가됨
    address: string;
    lengthKm: number;
    latitude: number;
    longitude: number;
    pathData: string;       // 추가됨 (Polyline 경로)
    imageUrl?: string;
    saveCount: number;      // 추가됨 (저장 수)
    isSaved?: boolean;      // 프론트에서만 쓰는 값 (찜 여부)

}