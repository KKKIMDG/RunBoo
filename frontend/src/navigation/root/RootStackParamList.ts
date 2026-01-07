import * as Location from "expo-location";
import { Coordinate } from "@/utils/runUtils";
import type { GhostProfileDto } from "@/types/ghost";

export type RootStackParamList = {
    MainStack: undefined;

    Running: {
        userId: number;
        targetDistance: number;
        mode?: "NORMAL";
    };

    TierRunning: {
        userId?: number;
        targetDistance: number;
        mode?: "TIER";
        distanceType?: "5km" | "10km";
    };

    GhostRun: {
        ghost: GhostProfileDto;
    };

    RunResult: {
        distanceM: number;
        durationSec: number;
        avgPaceSec: number;
        calories: number;
        routeCoordinates: Coordinate[];
    };

    TierResult: {
        userId?: number;
        recordId: number;
        distanceType: "5k" | "10k";
        achievedTier: string;
        isStopped?: boolean;

        stats: {
            distance: string;
            time: string;
            pace: string;
        };

        distanceM: number;
        durationSec: number;
        avgPaceSec: number;
        calories: number;
        routeCoordinates: Coordinate[];
    };

    MapFull: {
        location: Location.LocationObject | null;
    };

    /** ✅ 기록 상세보기 (신규) */
    RunRecordDetail: {
        recordId: number;
    };
};
