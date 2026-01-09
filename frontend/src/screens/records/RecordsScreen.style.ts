//frontend/src/screens/records/RecordsScreen.style.ts

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
        },
        title: {
            fontSize: 28,
            fontWeight: "700",
            color: Colors[scheme].text,
            marginTop: 20,
            marginLeft: 9,
        },
        subTitle: {
            color: Colors[scheme].icon,
            fontWeight: "600",
            marginTop: 7,
            marginLeft: 9,
        },
        errorText: {
            paddingVertical: 10,
            color: Colors[scheme].error,
            fontWeight: "700",
        },
        emptyText: {
            textAlign: "center",
            color: Colors[scheme].subtext,
        },
        center: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
    });
