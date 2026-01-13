//frontend/src/screens/records/RecordsScreen.style.ts

import { StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";
import {FontSizeSetting, scaleFont} from "@/utils/fontScale";

export const getStyles = (
    scheme: "light" | "dark",
    fontSize: FontSizeSetting
) =>
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
            fontSize: scaleFont(24, fontSize),
            fontWeight: "700",
            color: Colors[scheme].text,
            lineHeight: 32,
            marginLeft: 12,
        },
        subTitle: {
            fontSize: scaleFont(14, fontSize),
            color: Colors[scheme].icon,
            marginTop: 4,
            marginLeft: 12,
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
