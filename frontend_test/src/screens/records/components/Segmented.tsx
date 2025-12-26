import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/theme";

type Props = {
    leftLabel: string;
    rightLabel: string;
    value: "left" | "right";
    onChange: (v: "left" | "right") => void;
    scheme: 'light' | 'dark';
};

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
    wrap: {
        flexDirection: "row",
        backgroundColor: Colors[scheme].secondaryBackground,
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
        backgroundColor: Colors[scheme].primary,
    },
    text: { 
        color: Colors[scheme].icon,
        fontWeight: "700" 
    },
    activeText: { 
        color: Colors[scheme].background,
    },
});

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