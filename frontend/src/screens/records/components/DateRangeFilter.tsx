//frontend/src/screens/records/components/DateRangeFilter.tsx

import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Platform,
    Modal,
    LayoutAnimation,
    UIManager,
} from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

type Props = {
    fromDate: Date | null;
    toDate: Date | null;

    onChangeFromDate: (d: Date | null) => void;
    onChangeToDate: (d: Date | null) => void;
    onReset: () => void;
};

function fmt(d: Date | null) {
    if (!d) return "선택";
    const yy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
}

function startOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    return x;
}

function endOfDay(d: Date) {
    const x = new Date(d);
    x.setHours(23, 59, 59, 999);
    return x;
}

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function DateRangeFilter({
                                            fromDate,
                                            toDate,
                                            onChangeFromDate,
                                            onChangeToDate,
                                            onReset,
                                        }: Props) {
    const [expanded, setExpanded] = useState(false);
    const [pickerTarget, setPickerTarget] = useState<"from" | "to" | null>(null);

    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded((v) => !v);
    };

    const isActive = !!fromDate && !!toDate;

    const summaryText = useMemo(() => {
        if (!isActive) return "전체";
        return `${fmt(fromDate)} ~ ${fmt(toDate)}`;
    }, [isActive, fromDate, toDate]);

    const pickerValue = useMemo(() => {
        if (pickerTarget === "from") return fromDate ?? new Date();
        if (pickerTarget === "to") return toDate ?? new Date();
        return new Date();
    }, [pickerTarget, fromDate, toDate]);

    const closePicker = () => setPickerTarget(null);

    const applyPicked = (target: "from" | "to", picked: Date) => {
        if (target === "from") {
            const newFrom = startOfDay(picked);
            onChangeFromDate(newFrom);

            if (toDate && newFrom.getTime() > endOfDay(toDate).getTime()) {
                onChangeToDate(endOfDay(newFrom));
            }
            return;
        }

        if (target === "to") {
            const newTo = endOfDay(picked);
            onChangeToDate(newTo);
            if (fromDate && startOfDay(fromDate).getTime() > newTo.getTime()) {
                onChangeFromDate(startOfDay(newTo));
            }
        }
    };

    const onPickerChange = (event: DateTimePickerEvent, date?: Date) => {
        if (Platform.OS === "android") {
            if (event.type === "dismissed") {
                closePicker();
                return;
            }
            if (event.type === "set" && pickerTarget && date) {
                applyPicked(pickerTarget, date);
                closePicker();
            }
            return;
        }

        if (pickerTarget && date) {
            applyPicked(pickerTarget, date);
        }
    };

    const onPressFrom = () => {
        if (!expanded) {
            toggleExpanded();
            return;
        }
        setPickerTarget("from");
    };

    const onPressTo = () => {
        if (!expanded) {
            toggleExpanded();
            return;
        }
        setPickerTarget("to");
    };

    const onPressReset = () => {
        onReset();
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(false);
    };

    return (
        <View style={s.wrap}>
            <TouchableOpacity style={s.bar} onPress={toggleExpanded} activeOpacity={0.85}>
                <View style={s.barLeft}>
                    <Text style={s.title}>기간 조회</Text>
                </View>

                <View style={s.barRight}>
                    <Text style={s.subRight}>{summaryText}</Text>
                </View>
            </TouchableOpacity>

            {expanded && (
                <View style={s.panel}>
                    <View style={s.controls}>
                        <TouchableOpacity style={s.pickBtn} onPress={onPressFrom} activeOpacity={0.85}>
                            <Text style={s.pickLabel}>시작일</Text>
                            <Text style={s.pickValue}>{fmt(fromDate)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={s.pickBtn} onPress={onPressTo} activeOpacity={0.85}>
                            <Text style={s.pickLabel}>종료일</Text>
                            <Text style={s.pickValue}>{fmt(toDate)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[s.resetBtn]}
                            onPress={onPressReset}
                            activeOpacity={0.85}
                        >
                            <Text style={s.resetText}>초기화</Text>
                        </TouchableOpacity>
                    </View>

                    {pickerTarget && Platform.OS === "android" && (
                        <DateTimePicker
                            value={pickerValue}
                            mode="date"
                            display="calendar"
                            onChange={onPickerChange}
                        />
                    )}

                    {pickerTarget && Platform.OS === "ios" && (
                        <Modal visible transparent animationType="fade" onRequestClose={closePicker}>
                            <View style={s.modalDim}>
                                <View style={s.modalCard}>
                                    <Text style={s.modalTitle}>
                                        {pickerTarget === "from" ? "시작일 선택" : "종료일 선택"}
                                    </Text>

                                    <DateTimePicker
                                        value={pickerValue}
                                        mode="date"
                                        display="spinner"
                                        onChange={onPickerChange}
                                        style={{ alignSelf: "stretch" }}
                                    />

                                    <View style={s.modalBtns}>
                                        <TouchableOpacity
                                            style={[s.modalBtn, s.modalBtnGhost]}
                                            onPress={closePicker}
                                            activeOpacity={0.85}
                                        >
                                            <Text style={s.modalBtnGhostText}>닫기</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[s.modalBtn, s.modalBtnPrimary]}
                                            onPress={closePicker}
                                            activeOpacity={0.85}
                                        >
                                            <Text style={s.modalBtnPrimaryText}>확인</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    )}

                    {!isActive && (fromDate || toDate) && (
                        <Text style={s.hint}>시작일과 종료일을 모두 선택하면 기간 필터가 적용돼요.</Text>
                    )}
                </View>
            )}
        </View>
    );
}

const s = StyleSheet.create({
    wrap: {
        marginBottom: 0,
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
    controls: {
        flexDirection: "row",
        gap: 10,
        alignItems: "stretch"
    },
    pickBtn: {
        flex: 1,
        backgroundColor: "#F7F8FC",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    pickLabel: {
        color: "#6B7280",
        fontWeight: "900",
        fontSize: 12
    },
    pickValue: {
        marginTop: 4,
        color: "#111827",
        fontWeight: "900"
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
    hint: {
        marginTop: 8,
        color: "#6B7280",
        fontWeight: "700",
        fontSize: 12,
    },
    // iOS Modal
    modalDim: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 18,
    },
    modalCard: {
        width: "100%",
        backgroundColor: "white",
        borderRadius: 18,
        padding: 14,
    },
    modalTitle: {
        fontWeight: "900",
        color: "#111827",
        marginBottom: 10
    },
    modalBtns: {
        flexDirection: "row",
        gap: 10,
        marginTop: 10,
        justifyContent: "flex-end",
    },
    modalBtn: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 12,
    },
    modalBtnGhost: { backgroundColor: "#EEF1F7" },
    modalBtnGhostText: { color: "#687076", fontWeight: "900" },
    modalBtnPrimary: { backgroundColor: "#3A4A98" },
    modalBtnPrimaryText: { color: "white", fontWeight: "900" },
});
