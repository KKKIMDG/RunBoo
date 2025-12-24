import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
    leftLabel: string;
    rightLabel: string;
    value: "left" | "right";
    onChange: (v: "left" | "right") => void;
};

export default function Segmented({ leftLabel, rightLabel, value, onChange }: Props) {
    return (
        <View style={s.wrap}>
            <TouchableOpacity
                style={[s.item, value === "left" && s.active]}
                onPress={() => onChange("left")}
                activeOpacity={0.85}
            >
                <Text style={[s.text, value === "left" && s.activeText]}>{leftLabel}</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[s.item, value === "right" && s.active]}
                onPress={() => onChange("right")}
                activeOpacity={0.85}
            >
                <Text style={[s.text, value === "right" && s.activeText]}>{rightLabel}</Text>
            </TouchableOpacity>
        </View>
    );
}

const s = StyleSheet.create({
    wrap: {
        flexDirection: "row",
        backgroundColor: "#EEF1F7",
        padding: 4,
        borderRadius: 14,
    },
    item: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: "center",
    },
    active: { backgroundColor: "#2F4BFF" },
    text: { color: "#6B7280", fontWeight: "700" },
    activeText: { color: "white" },
});
