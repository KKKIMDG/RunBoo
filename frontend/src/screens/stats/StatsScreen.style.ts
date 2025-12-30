//frontend/src/screens/stats/StatsScreen.style.ts

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F5F7FB",
    },
    container: {
        flex: 1,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "900",
        color: "#111827",
    },
    subTitle: {
        marginTop: 4,
        color: "#6B7280",
        fontWeight: "600",
    },
    errorText: {
        paddingVertical: 10,
        color: "#EF4444",
        fontWeight: "700",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
