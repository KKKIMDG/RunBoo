// frontend/src/screens/records/components/RecordCard.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapView, { Polyline, PROVIDER_GOOGLE } from "react-native-maps";

import type { RecordDto, RunRecordDetailDto } from "@/types/record";
import {
    formatDate,
    formatKm,
    formatPace,
    formatTimeRange,
    formatDurationFromRange,
} from "./format";

import { fetchRunRecordDetail } from "@/services/record/recordsService";
import { decodePolyline, LatLng } from "@/utils/polyline";
import { Colors } from "@/constants/theme";
import { useSettings } from "@/screens/Settings/useSettings";
import { FontSizeSetting, scaleFont } from "@/utils/fontScale";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { darkMapStyle, lightMapStyle } from "@/screens/Home/mapStyles";

// ✅ routePolyline 캐시 (메모리 상 유지)
type RouteCacheValue = { detail: RunRecordDetailDto | null; routeError: boolean };
const routeCache = new Map<number, RouteCacheValue>();

function RecordCardInner({
                             item,
                             routeEnabled = false,
                         }: {
    item: RecordDto;
    routeEnabled?: boolean;
}) {
    const { settings } = useSettings();
    const colorScheme = useResolvedTheme(settings?.themeMode);
    const styles = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);

    const navigation = useNavigation<any>();

    const [detail, setDetail] = useState<RunRecordDetailDto | null>(null);
    const [routeError, setRouteError] = useState(false);

    const mapRef = useRef<MapView>(null);

    useEffect(() => {
        const recordId = Number(item.id);
        if (Number.isNaN(recordId)) return;

        // ✅ 1) 캐시에 있으면 즉시 사용하고 종료
        const cached = routeCache.get(recordId);
        if (cached) {
            setDetail(cached.detail);
            setRouteError(cached.routeError);
            return;
        }

        // ✅ 2) 화면에 보일 때만 로딩
        if (!routeEnabled) return;

        let alive = true;

        (async () => {
            try {
                setRouteError(false);
                const res = (await fetchRunRecordDetail(recordId)) as RunRecordDetailDto;

                if (!alive) return;

                const hasPolyline = !!res?.routePolyline;
                const nextRouteError = !hasPolyline;

                setDetail(res ?? null);
                setRouteError(nextRouteError);

                // ✅ 캐시 저장
                routeCache.set(recordId, { detail: res ?? null, routeError: nextRouteError });
            } catch (e) {
                if (!alive) return;
                setRouteError(true);
                setDetail(null);

                // ✅ 실패도 캐시(무한 재시도 방지)
                routeCache.set(recordId, { detail: null, routeError: true });
            }
        })();

        return () => {
            alive = false;
        };
    }, [item.id, routeEnabled]);

    const coords: LatLng[] = useMemo(() => {
        const poly = detail?.routePolyline ?? "";
        if (!poly) return [];
        try {
            return decodePolyline(poly);
        } catch {
            return [];
        }
    }, [detail?.routePolyline]);

    const midCoord = coords.length > 0 ? coords[Math.floor(coords.length / 2)] : null;

    useEffect(() => {
        if (!mapRef.current) return;
        if (coords.length < 2) return;

        mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 18, right: 18, bottom: 18, left: 18 },
            animated: false,
        });
    }, [coords]);

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate("RunRecordDetail", { recordId: item.id })}
        >
            <View style={styles.card}>
                <View style={styles.header}>
                    <Text style={styles.date}>{formatDate(item.startedAt)}</Text>
                    <Text
                        style={[
                            styles.badge,
                            item.mode === "GHOST" && styles.badgeGhost,
                            item.mode === "TIER" && styles.badgeTier,
                        ]}
                    >
                        {item.mode === "GHOST" ? "고스트" : item.mode === "TIER" ? "티어 측정" : "일반 측정"}
                    </Text>
                </View>

                <Text style={styles.sub}>{formatTimeRange(item.startedAt, item.endedAt)}</Text>

                <View style={styles.bodyRow}>
                    <View style={styles.leftCol}>
                        <View style={[styles.rowBox, styles.rowBoxFirst]}>
                            <Text style={styles.label}>런닝 거리</Text>
                            <Text style={styles.value}>{formatKm(item.distanceM)}</Text>
                        </View>

                        <View style={styles.rowBox}>
                            <Text style={styles.label}>평균 페이스</Text>
                            <Text style={styles.value}>{formatPace(item.avgPace)}</Text>
                        </View>

                        <View style={styles.rowBox}>
                            <Text style={styles.label}>런닝 시간</Text>
                            <Text style={styles.value}>{formatDurationFromRange(item.startedAt, item.endedAt)}</Text>
                        </View>
                    </View>

                    <View style={styles.mapCol} pointerEvents="none">
                        {coords.length > 0 && midCoord ? (
                            <MapView
                                ref={mapRef}
                                style={StyleSheet.absoluteFill}
                                provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                                initialRegion={{
                                    latitude: midCoord.latitude,
                                    longitude: midCoord.longitude,
                                    latitudeDelta: 0.02,
                                    longitudeDelta: 0.02,
                                }}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                rotateEnabled={false}
                                pitchEnabled={false}
                                toolbarEnabled={false}
                                showsCompass={false}
                                customMapStyle={colorScheme === "dark" ? darkMapStyle : lightMapStyle}
                            >
                                <Polyline
                                    coordinates={coords}
                                    strokeColor={colorScheme === "dark" ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)"}
                                    strokeWidth={10}
                                />
                                <Polyline
                                    coordinates={coords}
                                    strokeColor={
                                        colorScheme === "dark"
                                            ? "rgba(120, 160, 220, 0.45)"
                                            : "rgba(120, 160, 220, 0.55)"
                                    }
                                    strokeWidth={6}
                                />
                                <Polyline
                                    coordinates={coords}
                                    strokeColor={colorScheme === "dark" ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.70)"}
                                    strokeWidth={2}
                                />
                            </MapView>
                        ) : (
                            <View style={styles.mapPlaceholder}>
                                <Text style={styles.mapPlaceholderText}>
                                    {!routeEnabled
                                        ? "스크롤하면 로드돼요"
                                        : routeError
                                            ? "경로 없음"
                                            : "경로 불러오는 중…"}
                                </Text>
                            </View>
                        )}

                        <View style={styles.mapOverlay}>
                            <Text style={styles.mapOverlayText}>경로</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

// ✅ React.memo로 불필요 리렌더 방지
const RecordCard = React.memo(
    RecordCardInner,
    (prev, next) =>
        prev.item.id === next.item.id &&
        prev.routeEnabled === next.routeEnabled &&
        prev.item.startedAt === next.item.startedAt &&
        prev.item.endedAt === next.item.endedAt &&
        prev.item.mode === next.item.mode &&
        prev.item.distanceM === next.item.distanceM &&
        prev.item.avgPace === next.item.avgPace
);

export default RecordCard;

export const getStyles = (scheme: "light" | "dark", fontSize: FontSizeSetting) =>
    StyleSheet.create({
        card: {
            backgroundColor: Colors[scheme].background,
            borderRadius: 18,
            padding: 14,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: Colors[scheme].border,
        },
        header: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
        },
        date: {
            fontSize: scaleFont(16, fontSize),
            fontWeight: "800",
            color: Colors[scheme].text,
        },
        badge: {
            fontSize: scaleFont(12, fontSize),
            fontWeight: "900",
            color: Colors[scheme].icon,
            marginRight: 6,
        },
        badgeGhost: {
            color: scheme === "dark" ? "#C7A6E6" : "#9e80c0",
        },
        badgeTier: {
            color: scheme === "dark" ? "#86D07D" : "#54a54a",
        },
        sub: {
            marginTop: 4,
            marginBottom: 10,
            color: Colors[scheme].icon,
            fontWeight: "600",
        },
        bodyRow: {
            flexDirection: "row",
            gap: 10,
        },
        leftCol: {
            flex: 1,
        },
        rowBox: {
            backgroundColor: Colors[scheme].card,
            borderRadius: 14,
            paddingVertical: 10,
            paddingHorizontal: 12,
            marginTop: 8,
        },
        rowBoxFirst: {
            marginTop: 0,
        },
        label: {
            color: Colors[scheme].icon,
            fontWeight: "700",
            marginBottom: 4,
        },
        value: {
            color: Colors[scheme].text,
            fontSize: scaleFont(18, fontSize),
            fontWeight: "800",
        },
        mapCol: {
            flex: 1,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: Colors[scheme].secondaryBackground,
            borderWidth: 2,
            borderColor: Colors[scheme].card,
            minHeight: 158,
        },
        mapPlaceholder: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 10,
        },
        mapPlaceholderText: {
            color: Colors[scheme].subtext,
            fontWeight: "800",
            fontSize: scaleFont(12, fontSize),
            textAlign: "center",
        },
        mapOverlay: {
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: scheme === "dark" ? "rgba(255,255,255,0.16)" : "rgba(17,24,39,0.55)",
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 10,
        },
        mapOverlayText: {
            color: Colors[scheme].white,
            fontWeight: "900",
            fontSize: scaleFont(11, fontSize),
        },
    });
