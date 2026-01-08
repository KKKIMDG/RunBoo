// frontend/src/screens/records/components/RecordCard.tsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from "react-native";
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

export default function RecordCard({ item }: { item: RecordDto }) {
    const navigation = useNavigation<any>();

    const [detail, setDetail] = useState<RunRecordDetailDto | null>(null);
    const [routeError, setRouteError] = useState(false);

    // ✅ [추가] A방법: 지도 자동 확대용 ref
    const mapRef = useRef<MapView>(null);

    // ✅ 상세 화면처럼: 카드 렌더링 시 상세 API 호출해서 polyline 확보
    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setRouteError(false);
                const res = (await fetchRunRecordDetail(
                    Number(item.id)
                )) as RunRecordDetailDto;

                if (!alive) return;

                setDetail(res ?? null);

                // routePolyline 없으면 경로 없음 표시
                if (!res?.routePolyline) {
                    setRouteError(true);
                }
            } catch (e) {
                if (!alive) return;
                setRouteError(true);
                setDetail(null);
            }
        })();

        return () => {
            alive = false;
        };
    }, [item.id]);

    // ✅ 상세 화면과 동일하게 decode
    const coords: LatLng[] = useMemo(() => {
        const poly = detail?.routePolyline ?? "";
        if (!poly) return [];
        try {
            return decodePolyline(poly);
        } catch {
            return [];
        }
    }, [detail?.routePolyline]);

    const midCoord =
        coords.length > 0 ? coords[Math.floor(coords.length / 2)] : null;

    // ✅ [추가] coords 준비되면 경로가 카드 안에 꽉 차게 자동 확대
    useEffect(() => {
        if (!mapRef.current) return;
        if (coords.length < 2) return;

        mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 18, right: 18, bottom: 18, left: 18 },
            animated: false,
        });
    }, [coords]);

    // RunResultScreen 느낌의 연한 지도 스타일
    const blurredMapStyle = [
        { elementType: "geometry", stylers: [{ color: "#f0f0f0" }] },
        {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ visibility: "on" }, { color: "#ffffff" }, { weight: 1.5 }],
        },
        {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#c9d1d9" }],
        },
    ];

    return (
        <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
                navigation.navigate("RunRecordDetail", { recordId: item.id })
            }
        >
            <View style={s.card}>
                <View style={s.header}>
                    <Text style={s.date}>{formatDate(item.startedAt)}</Text>
                    <Text
                        style={[
                            s.badge,
                            item.mode === "GHOST" && s.badgeGhost,
                            item.mode === "TIER" && s.badgeTier,
                        ]}
                    >
                        {item.mode === "GHOST"
                            ? "고스트"
                            : item.mode === "TIER"
                                ? "티어 측정"
                                : "일반 측정"}
                    </Text>
                </View>

                <Text style={s.sub}>
                    {formatTimeRange(item.startedAt, item.endedAt)}
                </Text>

                {/** 가로 2분할 */}
                <View style={s.bodyRow}>
                    {/** 왼쪽*/}
                    <View style={s.leftCol}>
                        <View style={[s.rowBox, s.rowBoxFirst]}>
                            <Text style={s.label}>런닝 거리</Text>
                            <Text style={s.value}>{formatKm(item.distanceM)}</Text>
                        </View>

                        <View style={s.rowBox}>
                            <Text style={s.label}>평균 페이스</Text>
                            <Text style={s.value}>{formatPace(item.avgPace)}</Text>
                        </View>

                        <View style={s.rowBox}>
                            <Text style={s.label}>런닝 시간</Text>
                            <Text style={s.value}>
                                {formatDurationFromRange(item.startedAt, item.endedAt)}
                            </Text>
                        </View>
                    </View>

                    {/** 오른쪽: 지도 미리보기 */}
                    <View style={s.mapCol} pointerEvents="none">
                        {coords.length > 0 && midCoord ? (
                            <MapView
                                // ✅ [추가] TS 에러 없는 ref 연결
                                ref={mapRef}
                                style={StyleSheet.absoluteFill}
                                provider={
                                    Platform.OS === "android" ? PROVIDER_GOOGLE : undefined
                                }
                                customMapStyle={blurredMapStyle}
                                initialRegion={{
                                    latitude: midCoord.latitude,
                                    longitude: midCoord.longitude,
                                    latitudeDelta: 0.02,
                                    longitudeDelta: 0.02,
                                }}
                                // 지도 조작 전부 OFF
                                scrollEnabled={false}
                                zoomEnabled={false}
                                rotateEnabled={false}
                                pitchEnabled={false}
                                toolbarEnabled={false}
                                showsCompass={false}
                            >
                                {/* 상세 화면 느낌 그대로 3겹 */}
                                <Polyline
                                    coordinates={coords}
                                    strokeColor="rgba(0,0,0,0.10)"
                                    strokeWidth={10}
                                />
                                <Polyline
                                    coordinates={coords}
                                    strokeColor="rgba(120, 160, 220, 0.55)"
                                    strokeWidth={6}
                                />
                                <Polyline
                                    coordinates={coords}
                                    strokeColor="rgba(255,255,255,0.70)"
                                    strokeWidth={2}
                                />
                            </MapView>
                        ) : (
                            <View style={s.mapPlaceholder}>
                                <Text style={s.mapPlaceholderText}>
                                    {routeError ? "경로 없음" : "경로 불러오는 중…"}
                                </Text>
                            </View>
                        )}

                        <View style={s.mapOverlay}>
                            <Text style={s.mapOverlayText}>경로</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const s = StyleSheet.create({
    card: {
        backgroundColor: "#F5F7FB",
        borderRadius: 18,
        padding: 14,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#EEF1F7",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    date: {
        fontSize: 16,
        fontWeight: "800",
        color: "#111827",
    },
    badge: {
        fontSize: 12,
        fontWeight: "900",
        color: "#6B7280",
        marginRight: 6,
    },
    badgeGhost: {
        color: "#9e80c0",
    },
    badgeTier: {
        color: "#54a54a",
    },
    sub: {
        marginTop: 4,
        marginBottom: 10,
        color: "#6B7280",
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
        backgroundColor: "#FFF",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 8,
    },
    rowBoxFirst: {
        marginTop: 0,
    },
    label: {
        color: "#6B7280",
        fontWeight: "700",
        marginBottom: 4,
    },
    value: {
        color: "#111827",
        fontSize: 18,
        fontWeight: "800",
    },
    mapCol: {
        flex: 1,
        borderRadius: 14,
        overflow: "hidden",
        backgroundColor: "#E5E7EB",
        borderWidth: 2,
        borderColor: "#FFF",
        minHeight: 158,
    },
    mapPlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 10,
    },
    mapPlaceholderText: {
        color: "#6B7280",
        fontWeight: "800",
        fontSize: 12,
        textAlign: "center",
    },
    mapOverlay: {
        position: "absolute",
        top: 8,
        left: 8,
        backgroundColor: "rgba(17,24,39,0.55)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    mapOverlayText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 11,
    },
});
