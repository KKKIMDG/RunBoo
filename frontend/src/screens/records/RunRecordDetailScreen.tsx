import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as Location from "expo-location";

import { fetchRunRecordDetail } from "@/services/record/recordsService";
import { CourseService } from "@/services/course/CourseService";
import type { RunRecordDetailDto } from "@/types/record";
import { decodePolyline, LatLng } from "@/utils/polyline";
import { Colors } from "@/constants/theme";
import { useSettings } from "@/screens/Settings/useSettings";
import { FontSizeSetting, scaleFont } from "@/utils/fontScale";
import { useResolvedTheme } from "@/hooks/useResolvedTheme";
import { darkMapStyle, lightMapStyle } from "@/screens/Home/mapStyles";

type Params = { recordId: number };
type R = RouteProp<{ params: Params }, "params">;

export default function RunRecordDetailScreen() {
    const { settings } = useSettings();
    const colorScheme = useResolvedTheme(settings?.themeMode);

    const styles = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);

    const colors = Colors[colorScheme];

    const navigation = useNavigation<any>();
    const route = useRoute<R>();
    const recordId = route?.params?.recordId;

    const mapRef = useRef<MapView>(null);

    // ✅ 2단계 로딩: 화면은 즉시 보여주고, "데이터/경로"만 따로 로딩
    const [dataLoading, setDataLoading] = useState(true);
    const [data, setData] = useState<RunRecordDetailDto | null>(null);
    const [errorText, setErrorText] = useState<string | null>(null);

    // ✅ 지도 경로 영역만 별도 로딩 상태(체감 개선 포인트)
    const [routeLoading, setRouteLoading] = useState(true);

    // ✅ 모달 및 코스 정보 상태
    const [modalVisible, setModalVisible] = useState(false);
    const [courseName, setCourseName] = useState("");
    const [courseDesc, setCourseDesc] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // ✅ 주소 상태
    const [address, setAddress] = useState<string>("위치 정보 없음");

    // ✅ routePolyline decode (데이터 올 때만)
    const coords: LatLng[] = useMemo(() => {
        const poly = data?.routePolyline ?? "";
        if (!poly) return [];
        try {
            return decodePolyline(poly);
        } catch {
            return [];
        }
    }, [data?.routePolyline]);

    const midCoord = coords.length > 0 ? coords[Math.floor(coords.length / 2)] : null;
    const startCoord = coords.length > 0 ? coords[0] : null;
    const endCoord = coords.length > 0 ? coords[coords.length - 1] : null;

    const handleClose = () => navigation.goBack();

    const handleFocusRoute = useCallback(() => {
        if (coords.length > 0 && mapRef.current) {
            mapRef.current.fitToCoordinates(coords, {
                edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
                animated: true,
            });
        }
    }, [coords]);

    // ✅ 2단계 로딩 핵심: 화면은 막지 않고, 데이터는 백그라운드로
    useEffect(() => {
        let alive = true;

        (async () => {
            try {
                setErrorText(null);

                // 화면은 이미 렌더되는 상태이므로, 로딩 상태만 켜두고 시작
                setDataLoading(true);
                setRouteLoading(true);

                const res = (await fetchRunRecordDetail(Number(recordId))) as RunRecordDetailDto;

                if (!alive) return;

                setData(res ?? null);

                // routePolyline 있으면 지도 렌더 가능, 없으면 에러 메시지
                const hasRoute = !!res?.routePolyline;
                setRouteLoading(false);

                if (!hasRoute) {
                    setErrorText("경로 정보가 없거나 복원할 수 없어요.");
                }
            } catch (e) {
                if (!alive) return;
                setData(null);
                setErrorText("기록 상세를 불러오지 못했어요.");
                setRouteLoading(false);
            } finally {
                if (!alive) return;
                setDataLoading(false);
            }
        })();

        return () => {
            alive = false;
        };
    }, [recordId]);

    // ✅ 좌표 -> 주소 변환 (Reverse Geocoding)
    useEffect(() => {
        const fetchAddress = async () => {
            if (coords.length === 0) return;

            const start = coords[0];
            try {
                const { status } = await Location.getForegroundPermissionsAsync();
                if (status !== "granted") return;

                const result = await Location.reverseGeocodeAsync({
                    latitude: start.latitude,
                    longitude: start.longitude,
                });

                if (result.length > 0) {
                    const addr = result[0];
                    const region = addr.region || "";
                    const city = addr.city || "";
                    const street = addr.street || "";
                    const name = addr.name || "";

                    const fullAddress = `${region} ${city} ${street} ${name}`.trim() || "주소 정보 없음";
                    setAddress(fullAddress);
                }
            } catch (e) {
                console.log("주소 변환 실패:", e);
            }
        };

        fetchAddress();
    }, [coords]);

    const canShareCourse = !!data?.routePolyline && coords.length > 1 && !routeLoading;

    const handleOpenShare = () => {
        // ✅ 2단계 로딩: 경로 준비 전이면 안내만
        if (!canShareCourse) {
            Alert.alert("알림", "경로가 로딩된 후 코스로 공유할 수 있어요.");
            return;
        }
        setCourseName("나만의 러닝 코스");
        setCourseDesc("");
        setModalVisible(true);
    };

    const handleSubmitShare = async () => {
        if (!courseName.trim()) {
            Alert.alert("알림", "코스 이름을 입력해주세요.");
            return;
        }

        const startPoint = coords.length > 0 ? coords[0] : { latitude: 0, longitude: 0 };

        setIsUploading(true);
        try {
            await CourseService.createCourseFromRecord({
                recordId: Number(recordId),
                name: courseName,
                description: courseDesc,
                address: address,
                latitude: startPoint.latitude,
                longitude: startPoint.longitude,
            });

            Alert.alert("성공", "코스가 성공적으로 등록되었습니다! 🚩");
            setModalVisible(false);
        } catch (error) {
            console.error(error);
            Alert.alert("실패", "코스 등록 중 오류가 발생했습니다.");
        } finally {
            setIsUploading(false);
        }
    };

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
                            {dataLoading ? "  ·  불러오는 중…" : ""}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.8}>
                        <Ionicons name="close" size={20} color={colors.primaryButtonText} />
                    </TouchableOpacity>
                </View>

                {/* Map (✅ 2단계: 지도 영역만 로딩 표시) */}
                <View style={styles.mapArea}>
                    {routeLoading ? (
                        <View style={styles.mapLoadingBox}>
                            <ActivityIndicator size="large" color={colors.primaryButtonText} />
                            <Text style={styles.mapLoadingText}>경로 불러오는 중…</Text>
                            <Text style={styles.mapLoadingSubText}>데이터가 많으면 조금 걸릴 수 있어요</Text>
                        </View>
                    ) : coords.length > 0 && midCoord ? (
                        <View style={StyleSheet.absoluteFill}>
                            <MapView
                                ref={mapRef}
                                style={StyleSheet.absoluteFill}
                                provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                                onMapReady={handleFocusRoute}
                                initialRegion={{
                                    latitude: midCoord.latitude,
                                    longitude: midCoord.longitude,
                                    latitudeDelta: 0.015,
                                    longitudeDelta: 0.015,
                                }}
                                customMapStyle={colorScheme === "dark" ? darkMapStyle : lightMapStyle}
                            >
                                <Polyline coordinates={coords} strokeColor="rgba(0,0,0,0.1)" strokeWidth={16} />
                                <Polyline coordinates={coords} strokeColor="rgba(74,110,169,0.4)" strokeWidth={10} />
                                <Polyline coordinates={coords} strokeColor="rgba(120,160,220,0.5)" strokeWidth={6} />
                                <Polyline coordinates={coords} strokeColor="rgba(255,255,255,0.7)" strokeWidth={2} />

                                {startCoord && (
                                    <Marker coordinate={startCoord}>
                                        <View style={styles.markerCircle}>
                                            <View style={[styles.markerInner, { backgroundColor: "#4CAF50" }]} />
                                        </View>
                                    </Marker>
                                )}
                                {endCoord && (
                                    <Marker coordinate={endCoord}>
                                        <View style={styles.markerCircle}>
                                            <View style={[styles.markerInner, { backgroundColor: "#FF3B30" }]} />
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

                {/* Info (✅ 1단계: 데이터가 없어도 UI는 바로 보이게) */}
                <View style={styles.infoContent}>
                    <View style={styles.grid}>
                        <View style={styles.card}>
                            <MaterialCommunityIcons name="map-marker-distance" size={22} color={colors.text} />
                            <Text style={styles.cardLabel}>거리</Text>
                            <Text style={styles.cardValue}>
                                {data ? (data.distanceM ?? 0) / 1000 : "-"}
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

                        <View style={styles.card}>
                            <MaterialCommunityIcons name="shoe-print" size={22} color={colors.text} />
                            <Text style={styles.cardLabel}>케이던스</Text>
                            <Text style={styles.cardValue}>
                                {Number.isFinite(Number(data?.cadence)) ? Math.round(Number(data?.cadence)) : "-"}
                                <Text style={styles.cardUnit}> spm</Text>
                            </Text>
                        </View>

                        {/* ✅ 코스 공유 버튼: 경로 로딩 전엔 안내/비활성 느낌 */}
                        <TouchableOpacity
                            style={[
                                styles.card,
                                {
                                    backgroundColor: canShareCourse ? colors.primary : Colors[colorScheme].border,
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderColor: canShareCourse ? colors.primary : Colors[colorScheme].border,
                                },
                            ]}
                            onPress={handleOpenShare}
                            activeOpacity={0.85}
                        >
                            {routeLoading ? (
                                <ActivityIndicator size="small" color={canShareCourse ? "#fff" : colors.icon} />
                            ) : (
                                <Ionicons name="share-social" size={26} color={canShareCourse ? "#fff" : colors.icon} />
                            )}
                            <Text
                                style={{
                                    marginTop: 6,
                                    color: canShareCourse ? "#fff" : colors.icon,
                                    fontWeight: "800",
                                    fontSize: scaleFont(14, settings?.fontSize || "MEDIUM"),
                                }}
                            >
                                {routeLoading ? "경로 로딩 중" : "코스 공유"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* ✅ 공유 모달 */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{
                        flex: 1,
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "rgba(0,0,0,0.5)",
                    }}
                >
                    <View
                        style={{
                            width: "85%",
                            backgroundColor: colors.card,
                            borderRadius: 20,
                            padding: 20,
                            elevation: 5,
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 4,
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                color: colors.text,
                                marginBottom: 15,
                                textAlign: "center",
                            }}
                        >
                            코스 공유하기 🚩
                        </Text>

                        <Text style={{ color: colors.icon, fontSize: 12, marginBottom: 10, textAlign: "center" }}>
                            📍 {address}
                        </Text>

                        <Text style={{ color: colors.text, marginBottom: 6, fontWeight: "600" }}>코스 이름</Text>
                        <TextInput
                            value={courseName}
                            onChangeText={setCourseName}
                            placeholder="예: 여의도 벚꽃 런"
                            placeholderTextColor={colors.icon}
                            style={{
                                backgroundColor: colors.background,
                                color: colors.text,
                                padding: 12,
                                borderRadius: 10,
                                marginBottom: 15,
                                borderWidth: 1,
                                borderColor: colors.border,
                            }}
                        />

                        <Text style={{ color: colors.text, marginBottom: 6, fontWeight: "600" }}>코스 설명</Text>
                        <TextInput
                            value={courseDesc}
                            onChangeText={setCourseDesc}
                            placeholder="코스에 대한 팁이나 특징을 적어주세요."
                            placeholderTextColor={colors.icon}
                            multiline
                            style={{
                                backgroundColor: colors.background,
                                color: colors.text,
                                padding: 12,
                                borderRadius: 10,
                                height: 80,
                                marginBottom: 20,
                                borderWidth: 1,
                                borderColor: colors.border,
                                textAlignVertical: "top",
                            }}
                        />

                        <View style={{ flexDirection: "row", gap: 10 }}>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={{
                                    flex: 1,
                                    padding: 14,
                                    borderRadius: 10,
                                    backgroundColor: colors.background,
                                    alignItems: "center",
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                }}
                            >
                                <Text style={{ color: colors.text, fontWeight: "600" }}>취소</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handleSubmitShare}
                                disabled={isUploading}
                                style={{
                                    flex: 1,
                                    padding: 14,
                                    borderRadius: 10,
                                    backgroundColor: colors.primary,
                                    alignItems: "center",
                                }}
                            >
                                {isUploading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={{ color: "#fff", fontWeight: "bold" }}>공유하기</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

// 스타일 정의
export const getStyles = (scheme: "light" | "dark", fontSize: FontSizeSetting) =>
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
            fontSize: scaleFont(18, fontSize),
            fontWeight: "900",
            color: Colors[scheme].primaryButtonText,
        },
        subTitle: {
            marginTop: 4,
            fontSize: scaleFont(12, fontSize),
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

        // ✅ 지도 로딩 박스
        mapLoadingBox: {
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 18,
        },
        mapLoadingText: {
            marginTop: 10,
            color: Colors[scheme].text,
            fontWeight: "900",
            fontSize: scaleFont(14, fontSize),
        },
        mapLoadingSubText: {
            marginTop: 6,
            color: Colors[scheme].icon,
            fontWeight: "700",
            fontSize: scaleFont(12, fontSize),
            textAlign: "center",
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
            fontSize: scaleFont(12, fontSize),
        },
        cardValue: {
            marginTop: 6,
            color: Colors[scheme].text,
            fontWeight: "900",
            fontSize: scaleFont(18, fontSize),
        },
        cardUnit: {
            fontSize: scaleFont(12, fontSize),
            fontWeight: "900",
            color: Colors[scheme].icon,
        },
    });
