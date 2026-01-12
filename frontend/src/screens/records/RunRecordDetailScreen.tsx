import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import {
    Ionicons,
    MaterialCommunityIcons,
    FontAwesome5,
} from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";

import { fetchRunRecordDetail } from "@/services/record/recordsService";
import type { RunRecordDetailDto } from "@/types/record";
import { decodePolyline, LatLng } from "@/utils/polyline";
import { Colors } from "@/constants/theme";

type Params = { recordId: number };
type R = RouteProp<{ params: Params }, "params">;

export default function RunRecordDetailScreen() {
    const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";

    const styles = useMemo(() => {
        return getStyles(colorScheme);
    }, [colorScheme]);

    const colors = Colors[colorScheme];

    const navigation = useNavigation<any>();
    const route = useRoute<R>();
    const recordId = route?.params?.recordId;

    const mapRef = useRef<MapView>(null);

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<RunRecordDetailDto | null>(null);
    const [errorText, setErrorText] = useState<string | null>(null);

    const coords: LatLng[] = useMemo(() => {
        const poly = data?.routePolyline ?? "";
        try {
            return decodePolyline(poly);
        } catch {
            return [];
        }
    }, [data?.routePolyline]);

    const midCoord =
        coords.length > 0 ? coords[Math.floor(coords.length / 2)] : null;
    const startCoord = coords.length > 0 ? coords[0] : null;
    const endCoord = coords.length > 0 ? coords[coords.length - 1] : null;

    useEffect(() => {
        (async () => {
            try {
                setErrorText(null);
                setLoading(true);
                const res = (await fetchRunRecordDetail(
                    Number(recordId)
                )) as RunRecordDetailDto;
                setData(res);
            } catch (e) {
                setErrorText("기록 상세를 불러오지 못했어요.");
                setData(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [recordId]);

    const handleClose = () => navigation.goBack();

    const handleFocusRoute = () => {
        if (coords.length > 0 && mapRef.current) {
            mapRef.current.fitToCoordinates(coords, {
                edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
                animated: true,
            });
        }
    };

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

    if (loading) {
        return (
            <View style={styles.overlay}>
                <ActivityIndicator size="large" color={colors.primaryButtonText} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.overlay} edges={["top", "bottom"]}>
            <View style={styles.popupContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.title}>기록 상세보기</Text>
                        <Text style={styles.subTitle}>
                            {data?.mode === "GHOST"
                                ? "고스트"
                                : data?.mode === "TIER"
                                    ? "티어 측정"
                                    : "일반 측정"}
                            {"  ·  "}#{data?.recordId ?? "-"}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                        activeOpacity={0.8}
                    >
                        <Ionicons name="close" size={20} color={colors.primaryButtonText} />
                    </TouchableOpacity>
                </View>

                {/* Map */}
                <View style={styles.mapArea}>
                    {coords.length > 0 && midCoord ? (
                        <View style={StyleSheet.absoluteFill}>
                            <MapView
                                ref={mapRef}
                                style={StyleSheet.absoluteFill}
                                provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                                onMapReady={handleFocusRoute}
                                customMapStyle={blurredMapStyle}
                                initialRegion={{
                                    latitude: midCoord.latitude,
                                    longitude: midCoord.longitude,
                                    latitudeDelta: 0.015,
                                    longitudeDelta: 0.015,
                                }}
                            >
                                <Polyline
                                    coordinates={coords}
                                    strokeColor="rgba(0,0,0,0.1)"
                                    strokeWidth={16}
                                />
                                <Polyline
                                    coordinates={coords}
                                    strokeColor="rgba(74,110,169,0.4)"
                                    strokeWidth={10}
                                />
                                <Polyline
                                    coordinates={coords}
                                    strokeColor="rgba(120,160,220,0.5)"
                                    strokeWidth={6}
                                />
                                <Polyline
                                    coordinates={coords}
                                    strokeColor="rgba(255,255,255,0.7)"
                                    strokeWidth={2}
                                />

                                {startCoord && (
                                    <Marker coordinate={startCoord}>
                                        <View style={styles.markerCircle}>
                                            <View
                                                style={[
                                                    styles.markerInner,
                                                    { backgroundColor: "#4CAF50" },
                                                ]}
                                            />
                                        </View>
                                    </Marker>
                                )}

                                {endCoord && (
                                    <Marker coordinate={endCoord}>
                                        <View style={styles.markerCircle}>
                                            <View
                                                style={[
                                                    styles.markerInner,
                                                    { backgroundColor: "#FF3B30" },
                                                ]}
                                            />
                                        </View>
                                    </Marker>
                                )}
                            </MapView>

                            <TouchableOpacity style={styles.focusButton} onPress={handleFocusRoute}>
                                <MaterialCommunityIcons name="altimeter" size={22} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.mapPlaceholder}>
                            <Text style={styles.mapPlaceholderText}>
                                {errorText ?? "경로 정보가 없거나 복원할 수 없어요."}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.infoContent}>
                    <View style={styles.grid}>
                        <View style={styles.card}>
                            <MaterialCommunityIcons
                                name="map-marker-distance"
                                size={22}
                                color={colors.text}
                            />
                            <Text style={styles.cardLabel}>거리</Text>
                            <Text style={styles.cardValue}>
                                {(data?.distanceM ?? 0) / 1000}
                                <Text style={styles.cardUnit}> km</Text>
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <Ionicons name="time-outline" size={22} color={colors.text} />
                            <Text style={styles.cardLabel}>시간</Text>
                            <Text style={styles.cardValue}>{data?.timeText ?? "-"}</Text>
                        </View>

                        <View style={styles.card}>
                            <FontAwesome5 name="running" size={18} color={colors.text} />
                            <Text style={styles.cardLabel}>페이스</Text>
                            <Text style={styles.cardValue}>
                                {data?.paceText ?? "-"}
                                <Text style={styles.cardUnit}> /km</Text>
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <Ionicons name="flame-outline" size={22} color={colors.text} />
                            <Text style={styles.cardLabel}>칼로리</Text>
                            <Text style={styles.cardValue}>
                                {data?.calories ?? "-"}
                                <Text style={styles.cardUnit}> kcal</Text>
                            </Text>
                        </View>

                        {/* ✅ [추가] 케이던스 카드 */}
                        <View style={styles.card}>
                            <MaterialCommunityIcons
                                name="shoe-print"
                                size={22}
                                color={colors.text}
                            />
                            <Text style={styles.cardLabel}>케이던스</Text>
                            <Text style={styles.cardValue}>
                                {Number.isFinite(Number(data?.cadence))
                                    ? Math.round(Number(data?.cadence))
                                    : 0}
                                <Text style={styles.cardUnit}> spm</Text>
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

export const getStyles = (scheme: "light" | "dark") =>
    StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.6)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
        },
        popupContainer: {
            backgroundColor: Colors[scheme].background,
            width: "100%",
            height: "78%",
            borderRadius: 18,
            overflow: "hidden",
        },
        header: {
            backgroundColor: Colors[scheme].primary,
            paddingHorizontal: 16,
            paddingTop: 16,
            paddingBottom: 14,
            flexDirection: "row",
        },
        title: {
            fontSize: 18,
            fontWeight: "900",
            color: Colors[scheme].primaryButtonText,
        },
        subTitle: {
            marginTop: 4,
            fontSize: 12,
            fontWeight: "700",
            color: Colors[scheme].icon,
        },
        closeButton: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "rgba(255,255,255,0.16)",
            justifyContent: "center",
            alignItems: "center",
        },
        mapArea: {
            flex: 1,
            backgroundColor: Colors[scheme].border,
        },
        mapPlaceholder: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 18,
        },
        mapPlaceholderText: {
            color: Colors[scheme].text,
            fontWeight: "800",
            textAlign: "center",
        },
        focusButton: {
            position: "absolute",
            bottom: 14,
            right: 14,
            backgroundColor: Colors[scheme].background,
            padding: 10,
            borderRadius: 30,
            shadowColor: Colors[scheme].shadow,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.18,
            shadowRadius: 3,
            elevation: 5,
        },
        markerCircle: {
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: Colors[scheme].background,
            justifyContent: "center",
            alignItems: "center",
        },
        markerInner: {
            width: 10,
            height: 10,
            borderRadius: 5,
        },
        infoContent: {
            padding: 14,
            paddingBottom: 16,
        },
        grid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 10,
        },
        card: {
            width: "48%",
            backgroundColor: Colors[scheme].card,
            borderRadius: 14,
            padding: 12,
            borderWidth: 1,
            borderColor: Colors[scheme].border,
        },
        cardLabel: {
            marginTop: 6,
            color: Colors[scheme].icon,
            fontWeight: "800",
            fontSize: 12,
        },
        cardValue: {
            marginTop: 6,
            color: Colors[scheme].text,
            fontWeight: "900",
            fontSize: 18,
        },
        cardUnit: {
            fontSize: 12,
            fontWeight: "900",
            color: Colors[scheme].icon,
        },
    });
