import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

type Scheme = "light" | "dark";
const getScheme = (scheme?: Scheme): Scheme => (scheme === "dark" ? "dark" : "light");

export const getStyles = (scheme?: Scheme) => {
    const sc = getScheme(scheme);
    return StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: 16,
            paddingTop: 14,
            backgroundColor: Colors[sc].background,
        },
        title: {
            fontSize: 22,
            fontWeight: "900",
            color: Colors[sc].text,
        },
        subTitle: {
            marginTop: 4,
            color: Colors[sc].icon,
            fontWeight: "600",
        },
        center: {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
        },
        segmentedContainer: {
            marginTop: 12,
            marginBottom: 12,
        },
        errorContainer: {
            paddingVertical: 10,
        },
        errorText: {
            color: "#EF4444",
            fontWeight: "700",
        },
        scrollContent: {
            paddingBottom: 24,
        },
    });
};
