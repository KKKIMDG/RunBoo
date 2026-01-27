import { NativeModules, Platform } from "react-native";

type RunningServiceNative = {
    start: () => void;
    stop: () => void;
};

const NativeRunningService: RunningServiceNative | null =
    Platform.OS === "android"
        ? NativeModules.RunningService
        : null;

/**
 * 러닝 시작 시 Android Foreground Service 시작
 */
export const startRunningService = () => {
    if (Platform.OS !== "android") return;

    if (!NativeRunningService) {
        console.warn("[RunningService] Native module not found");
        return;
    }

    NativeRunningService.start();
};

/**
 * 러닝 종료 시 Android Foreground Service 종료
 */
export const stopRunningService = () => {
    if (Platform.OS !== "android") return;

    if (!NativeRunningService) {
        console.warn("[RunningService] Native module not found");
        return;
    }

    NativeRunningService.stop();
};
