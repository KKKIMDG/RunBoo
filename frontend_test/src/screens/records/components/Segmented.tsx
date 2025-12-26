import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

type Scheme = "light" | "dark";
type Props = {
    leftLabel: string;
    rightLabel: string;
    value: "left" | "right";
    onChange: (v: "left" | "right") => void;
    scheme?: Scheme;
};

const norm = (s?: Scheme): Scheme => (s === "dark" ? "dark" : "light");

const getStyles = (scheme?: Scheme) => {
    const sc = norm(scheme);
    return StyleSheet.create({
        wrap: {
            flexDirection: "row",
            backgroundColor: Colors[sc].secondaryBackground,
            padding: 4,
            borderRadius: 14,
        },
        item: {
            flex: 1,
            paddingVertical: 8,
            borderRadius: 12,
            alignItems: "center",
        },
        active: {
            backgroundColor: Colors[sc].primary,
        },
        text: {
            color: Colors[sc].icon,
            fontWeight: "700",
        },
        activeText: {
            color: Colors[sc].background,
        },
    });
};

export default function Segmented({ leftLabel, rightLabel, value, onChange, scheme }: Props) {
    const styles = getStyles(scheme);

    return (
        <View style={styles.wrap}>
            <TouchableOpacity
                style={[styles.item, value === "left" && styles.active]}
                onPress={() => onChange("left")}
                activeOpacity={0.85}
            >
                <Text style={[styles.text, value === "left" && styles.activeText]}>{leftLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.item, value === "right" && styles.active]}
                onPress={() => onChange("right")}
                activeOpacity={0.85}
            >
                <Text style={[styles.text, value === "right" && styles.activeText]}>{rightLabel}</Text>
            </TouchableOpacity>
        </View>
    );
}
