import { useCallback } from "react";
import { BackHandler } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export function useBlockBack() {
    useFocusEffect(
        useCallback(() => {
            const subscription = BackHandler.addEventListener(
                "hardwareBackPress",
                () => true // 뒤로가기 완전 차단
            );

            return () => {
                subscription.remove(); //
            };
        }, [])
    );
}
