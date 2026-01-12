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
            paddingHorizontal: 20,
            paddingTop: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: "700",
            color: Colors[scheme].text,
            lineHeight: 32,
            marginLeft: 12,
        },
        subTitle: {
            fontSize: 14,
            color: Colors[scheme].icon,
            marginTop: 4,
            marginLeft: 12,
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
