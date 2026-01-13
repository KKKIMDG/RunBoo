//frontend/src/screens/records/components/ModeFilter.tsx

import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    LayoutAnimation,
    Platform,
    UIManager,
    useColorScheme,
} from "react-native";
import { Colors } from "@/constants/theme";
import {useSettings} from "@/screens/Settings/useSettings";
import {FontSizeSetting, scaleFont} from "@/utils/fontScale";

// 러닝 모드는 NORMAL, GHOST, TIER 3가지
type Mode = "NORMAL" | "GHOST" | "TIER";

type Props = {
    mode: Mode | null;
    onChangeMode: (m: Mode | null) => void;
    onReset: () => void;
};

// 안드로이드 운영체제의 경우에만 레이아웃 애니메이션 기능 활성화됨
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

function modeLabel(m: Mode) {
    if (m === "NORMAL") return "일반";
    if (m === "GHOST") return "고스트";
    return "티어 측정";
}

export default function ModeFilter({ mode, onChangeMode, onReset }: Props) {
    const { settings } = useSettings();
    const colorScheme = useColorScheme() ?? "light";
    const styles = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);

    const [expanded, setExpanded] = useState(false);

    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded((v) => !v);
    };

    const isActive = !!mode;

    const summaryText = useMemo(() => {
        if (!isActive) return "전체";
        return mode ? modeLabel(mode) : "전체";
    }, [isActive, mode]);

    const pick = (m: Mode) => {
        onChangeMode(mode === m ? null : m);
    };

    const onPressReset = () => {
        onReset(); // mode=null => 전체(OFF처럼)
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(false);
    };

    return (
        <View style={styles.wrap}>
            <TouchableOpacity style={styles.bar} onPress={toggleExpanded} activeOpacity={0.85}>
                <View style={styles.barLeft}>
                    <Text style={styles.title}>러닝 모드</Text>
                </View>

                <View style={styles.barRight}>
                    <Text style={styles.subRight}>{summaryText}</Text>
                </View>
            </TouchableOpacity>

            {expanded && (
                <View style={styles.panel}>
                    <View style={styles.row}>
                        <TouchableOpacity
                            style={[styles.modeBtn, mode === "NORMAL" && styles.modeBtnActive]}
                            onPress={() => pick("NORMAL")}
                            activeOpacity={0.75}
                        >
                            <Text style={[styles.modeText, mode === "NORMAL" && styles.modeTextActive]}>
                                일반
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modeBtn, mode === "GHOST" && styles.modeBtnActive]}
                            onPress={() => pick("GHOST")}
                            activeOpacity={0.75}
                        >
                            <Text style={[styles.modeText, mode === "GHOST" && styles.modeTextActive]}>
                                고스트
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modeBtn, mode === "TIER" && styles.modeBtnActive]}
                            onPress={() => pick("TIER")}
                            activeOpacity={0.75}
                        >
                            <Text style={[styles.modeText, mode === "TIER" && styles.modeTextActive]}>
                                티어 측정
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.resetBtn}
                            onPress={onPressReset}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.resetText}>초기화</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

export const getStyles = (
    scheme: "light" | "dark",
    fontSize: FontSizeSetting
) =>
    StyleSheet.create({
        wrap: {
            marginBottom: 10,
        },
        bar: {
            backgroundColor: "transparent",
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
        },
        barLeft: {
            flex: 1,
            paddingRight: 10,
        },
        title: {
            color: Colors[scheme].icon,
            fontWeight: "700",
        },
        barRight: {
            alignItems: "flex-end",
            justifyContent: "flex-end",
            minWidth: 80,
        },
        subRight: {
            color: Colors[scheme].icon,
            fontWeight: "700",
            marginTop: 0,
        },
        panel: {
            marginTop: 10,
            backgroundColor: Colors[scheme].secondaryBackground,
            borderRadius: 16,
            padding: 10,
        },
        row: {
            flexDirection: "row",
            gap: 10,
            alignItems: "stretch",
        },
        modeBtn: {
            flex: 1,
            backgroundColor: Colors[scheme].background,
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 10,
            alignItems: "center",
            justifyContent: "center",
        },
        modeBtnActive: {
            backgroundColor: Colors[scheme].primary,
        },
        modeText: {
            color: Colors[scheme].icon,
            fontWeight: "900",
            fontSize: scaleFont(12, fontSize),
        },
        modeTextActive: {
            color: Colors[scheme].primaryButtonText,
        },
        resetBtn: {
            width: 86,
            borderRadius: 14,
            backgroundColor: Colors[scheme].card,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 10,
            borderWidth: 1,
            borderColor: Colors[scheme].border,
        },
        resetText: {
            color: Colors[scheme].error,
            fontWeight: "900",
            fontSize: scaleFont(12, fontSize),
        },
    });
