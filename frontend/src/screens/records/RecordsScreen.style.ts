//frontend/src/screens/records/RecordsScreen.style.ts

import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#FFF",
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111827",
        marginTop: 20,
        marginLeft: 9,
    },
    subTitle: {
        color: "#6B7280",
        fontWeight: "600",
        marginTop: 7,
        marginLeft: 9,
    },
    errorText: {
        paddingVertical: 10,
        color: "#EF4444",
        fontWeight: "700",
    },
    emptyText: {
        textAlign: "center",
        color: "#6B7280",
    },
    center: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
});
