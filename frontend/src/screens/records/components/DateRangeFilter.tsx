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
import { Colors } from "@/constants/theme";
import {FontSizeSetting, scaleFont} from "@/utils/fontScale";
import {useSettings} from "@/screens/Settings/useSettings";
import {useResolvedTheme} from "@/hooks/useResolvedTheme";

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
    const { settings } = useSettings();
    const colorScheme = useResolvedTheme(settings?.themeMode);
    const styles = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);

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
        <View style={styles.wrap}>
            <TouchableOpacity style={styles.bar} onPress={toggleExpanded} activeOpacity={0.85}>
                <View style={styles.barLeft}>
                    <Text style={styles.title}>기간 조회</Text>
                </View>

                <View style={styles.barRight}>
                    <Text style={styles.subRight}>{summaryText}</Text>
                </View>
            </TouchableOpacity>

            {expanded && (
                <View style={styles.panel}>
                    <View style={styles.controls}>
                        <TouchableOpacity style={styles.pickBtn} onPress={onPressFrom} activeOpacity={0.85}>
                            <Text style={styles.pickLabel}>시작일</Text>
                            <Text style={styles.pickValue}>{fmt(fromDate)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.pickBtn} onPress={onPressTo} activeOpacity={0.85}>
                            <Text style={styles.pickLabel}>종료일</Text>
                            <Text style={styles.pickValue}>{fmt(toDate)}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.resetBtn} onPress={onPressReset} activeOpacity={0.85}>
                            <Text style={styles.resetText}>초기화</Text>
                        </TouchableOpacity>
                    </View>

                    {pickerTarget && Platform.OS === "android" && (
                        <DateTimePicker value={pickerValue} mode="date" display="calendar" onChange={onPickerChange} />
                    )}

                    {pickerTarget && Platform.OS === "ios" && (
                        <Modal visible transparent animationType="fade" onRequestClose={closePicker}>
                            <View style={styles.modalDim}>
                                <View style={styles.modalCard}>
                                    <Text style={styles.modalTitle}>
                                        {pickerTarget === "from" ? "시작일 선택" : "종료일 선택"}
                                    </Text>

                                    <DateTimePicker
                                        value={pickerValue}
                                        mode="date"
                                        display="spinner"
                                        onChange={onPickerChange}
                                        style={{ alignSelf: "stretch" }}
                                    />

                                    <View style={styles.modalBtns}>
                                        <TouchableOpacity
                                            style={[styles.modalBtn, styles.modalBtnGhost]}
                                            onPress={closePicker}
                                            activeOpacity={0.85}
                                        >
                                            <Text style={styles.modalBtnGhostText}>닫기</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.modalBtn, styles.modalBtnPrimary]}
                                            onPress={closePicker}
                                            activeOpacity={0.85}
                                        >
                                            <Text style={styles.modalBtnPrimaryText}>확인</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Modal>
                    )}

                    {!isActive && (fromDate || toDate) && (
                        <Text style={styles.hint}>시작일과 종료일을 모두 선택하면 기간 필터가 적용돼요.</Text>
                    )}
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
        controls: {
            flexDirection: "row",
            gap: 10,
            alignItems: "stretch",
        },
        pickBtn: {
            flex: 1,
            backgroundColor: Colors[scheme].background,
            borderRadius: 14,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderWidth: 1,
            borderColor: Colors[scheme].border,
        },
        pickLabel: {
            color: Colors[scheme].icon,
            fontWeight: "900",
            fontSize: scaleFont(12, fontSize),
        },
        pickValue: {
            marginTop: 4,
            color: Colors[scheme].text,
            fontWeight: "900",
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
        hint: {
            marginTop: 8,
            color: Colors[scheme].subtext,
            fontWeight: "700",
            fontSize: scaleFont(12, fontSize),
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
            backgroundColor: Colors[scheme].card,
            borderRadius: 18,
            padding: 14,
            borderWidth: 1,
            borderColor: Colors[scheme].border,
        },
        modalTitle: {
            fontWeight: "900",
            color: Colors[scheme].text,
            marginBottom: 10,
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
        modalBtnGhost: {
            backgroundColor: Colors[scheme].secondaryBackground,
        },
        modalBtnGhostText: {
            color: Colors[scheme].icon,
            fontWeight: "900",
        },
        modalBtnPrimary: {
            backgroundColor: Colors[scheme].primary,
        },
        modalBtnPrimaryText: {
            color: Colors[scheme].primaryButtonText,
            fontWeight: "900",
        },
    });
