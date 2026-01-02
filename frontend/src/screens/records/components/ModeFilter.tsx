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
} from "react-native";

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
        <View style={s.wrap}>
            <TouchableOpacity style={s.bar} onPress={toggleExpanded} activeOpacity={0.85}>
                <View style={s.barLeft}>
                    <Text style={s.title}>러닝 모드</Text>
                </View>

                <View style={s.barRight}>
                    <Text style={s.subRight}>{summaryText}</Text>
                </View>
            </TouchableOpacity>

            {expanded && (
                <View style={s.panel}>
                    <View style={s.row}>
                        <TouchableOpacity
                            style={[s.modeBtn, mode === "NORMAL" && s.modeBtnActive]}
                            onPress={() => pick("NORMAL")}
                            activeOpacity={0.75}
                        >
                            <Text style={[s.modeText, mode === "NORMAL" && s.modeTextActive]}>
                                일반
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[s.modeBtn, mode === "GHOST" && s.modeBtnActive]}
                            onPress={() => pick("GHOST")}
                            activeOpacity={0.75}
                        >
                            <Text style={[s.modeText, mode === "GHOST" && s.modeTextActive]}>
                                고스트
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[s.modeBtn, mode === "TIER" && s.modeBtnActive]}
                            onPress={() => pick("TIER")}
                            activeOpacity={0.75}
                        >
                            <Text style={[s.modeText, mode === "TIER" && s.modeTextActive]}>
                                티어 측정
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={s.resetBtn}
                            onPress={onPressReset}
                            activeOpacity={0.85}
                        >
                            <Text style={s.resetText}>초기화</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

const s = StyleSheet.create({
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
        paddingRight: 10
    },
    title: {
        color: "#6B7280",
        fontWeight: "700"
    },
    barRight: {
        alignItems: "flex-end",
        justifyContent: "flex-end",
        minWidth: 80,
    },
    subRight: {
        color: "#6B7280",
        fontWeight: "700",
        marginTop: 0,
    },
    panel: {
        marginTop: 10,
        backgroundColor: "#EEF1F7",
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
        backgroundColor: "#F7F8FC",
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    modeBtnActive: {
        backgroundColor: "#3A4A98",
    },
    modeText: {
        color: "#687076",
        fontWeight: "900",
        fontSize: 12,
    },
    modeTextActive: {
        color: "white",
    },
    resetBtn: {
        width: 86,
        borderRadius: 14,
        backgroundColor: "#FFF1F2",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 10,
    },
    resetText: {
        color: "#EF4444",
        fontWeight: "900",
        fontSize: 12,
    },
});
