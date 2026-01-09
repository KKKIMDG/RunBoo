//frontend/src/screens/stats/StatsScreen.style.ts

import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

export const getStyles = (scheme: "light" | "dark") =>
    StyleSheet.create({
        safeArea: {
            flex: 1,
            backgroundColor: Colors[scheme].background,
        },
        container: {
            flex: 1,
            paddingHorizontal: 16,
        },
        title: {
            fontSize: 22,
            fontWeight: "900",
            color: Colors[scheme].text,
        },
        subTitle: {
            marginTop: 4,
            color: Colors[scheme].subtext,
            fontWeight: "600",
        },
        errorText: {
            paddingVertical: 10,
            color: Colors[scheme].error,
            fontWeight: "700",
        },
        center: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
    });
