import React, { useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    useColorScheme,
} from "react-native";
import { Colors } from "@/constants/theme";

type Props = {
    leftLabel: string;
    rightLabel: string;
    value: "left" | "right";
    onChange: (v: "left" | "right") => void;
};

export default function Segmented({
                                      leftLabel,
                                      rightLabel,
                                      value,
                                      onChange,
                                  }: Props) {
    const colorScheme = useColorScheme() ?? "light";

    const styles = useMemo(() => {
        return getStyles(colorScheme);
    }, [colorScheme]);

    const leftActive = value === "left";
    const rightActive = value === "right";

    return (
        <View style={styles.wrap}>
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onChange("left")}
                style={[styles.btn, leftActive && styles.btnActive]}
            >
                <Text style={[styles.txt, leftActive && styles.txtActive]}>
                    {leftLabel}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onChange("right")}
                style={[styles.btn, rightActive && styles.btnActive]}
            >
                <Text style={[styles.txt, rightActive && styles.txtActive]}>
                    {rightLabel}
                </Text>
            </TouchableOpacity>
        </View>
    );
}

export const getStyles = (scheme: "light" | "dark") =>
    StyleSheet.create({
        wrap: {
            flexDirection: "row",
            backgroundColor: "transparent",
            borderRadius: 20,
            borderWidth: 1,
            borderColor: Colors[scheme].border,
            padding: 4,
        },

        btn: {
            flex: 1,
            height: 44,
            borderRadius: 20,
            alignItems: "center",
            justifyContent: "center",
            padding: 7,
            marginTop: 2,
            marginBottom: 2,
        },

        btnActive: {
            backgroundColor: Colors[scheme].primary,
            shadowColor: Colors[scheme].shadow,
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
        },

        txt: {
            fontSize: 14,
            fontWeight: "600",
            color: Colors[scheme].icon,
        },

        txtActive: {
            color: Colors[scheme].primaryButtonText,
        },
    });
