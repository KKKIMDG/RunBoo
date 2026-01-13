import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    useColorScheme,
    Modal,
    TextInput,
    KeyboardAvoidingView,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import {
    Ionicons,
    MaterialCommunityIcons,
    FontAwesome5,
} from "@expo/vector-icons";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import * as Location from 'expo-location'; // ✅ 위치 모듈 추가

import { fetchRunRecordDetail } from "@/services/record/recordsService";
import { CourseService } from "@/services/course/CourseService";
import type { RunRecordDetailDto } from "@/types/record";
import { decodePolyline, LatLng } from "@/utils/polyline";
import { Colors } from "@/constants/theme";
import { useSettings } from "@/screens/Settings/useSettings";
import { FontSizeSetting, scaleFont } from "@/utils/fontScale";

type Params = { recordId: number };
type R = RouteProp<{ params: Params }, "params">;

export default function RunRecordDetailScreen() {
    const { settings } = useSettings();
    const colorScheme = useColorScheme() ?? "light";
    const styles = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);

    const colors = Colors[colorScheme];

    const navigation = useNavigation<any>();
    const route = useRoute<R>();
    const recordId = route?.params?.recordId;

    const mapRef = useRef<MapView>(null);

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<RunRecordDetailDto | null>(null);
    const [errorText, setErrorText] = useState<string | null>(null);

    // 모달 및 코스 정보 상태
    const [modalVisible, setModalVisible] = useState(false);
    const [courseName, setCourseName] = useState("");
    const [courseDesc, setCourseDesc] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    // ✅ 주소 상태 추가
    const [address, setAddress] = useState<string>("위치 정보 없음");

    const coords: LatLng[] = useMemo(() => {
        const poly = data?.routePolyline ?? "";
        try {
            return decodePolyline(poly);
        } catch {
            return [];
        }
    }, [data?.routePolyline]);

    const midCoord = coords.length > 0 ? coords[Math.floor(coords.length / 2)] : null;
    const startCoord = coords.length > 0 ? coords[0] : null;
    const endCoord = coords.length > 0 ? coords[coords.length - 1] : null;

    useEffect(() => {
        (async () => {
            try {
                setErrorText(null);
                setLoading(true);
                const res = (await fetchRunRecordDetail(Number(recordId))) as RunRecordDetailDto;
                setData(res);
            } catch (e) {
                setErrorText("기록 상세를 불러오지 못했어요.");
                setData(null);
            } finally {
                setLoading(false);
            }
        })();
    }, [recordId]);

    // ✅ [핵심] 좌표가 있으면 주소 변환 (Reverse Geocoding)
    useEffect(() => {
        const fetchAddress = async () => {
            if (coords.length > 0) {
                const start = coords[0];
                try {
                    // 1. 권한 확인 (보통 앱 실행 시 받았겠지만 안전하게 체크)
                    const { status } = await Location.getForegroundPermissionsAsync();
                    if (status !== 'granted') return;

                    // 2. 좌표 -> 주소 변환
                    const result = await Location.reverseGeocodeAsync({
                        latitude: start.latitude,
                        longitude: start.longitude
                    });

                    if (result.length > 0) {
                        const addr = result[0];
                        // 주소 조합 (null 체크)
                        const region = addr.region || "";
                        const city = addr.city || "";
                        const street = addr.street || "";
                        const name = addr.name || "";

                        // 보기 좋은 형태로 조합
                        const fullAddress = `${region} ${city} ${street} ${name}`.trim() || "주소 정보 없음";
                        setAddress(fullAddress);
                    }
                } catch (e) {
                    console.log("주소 변환 실패:", e);
                }
            }
        };
        fetchAddress();
    }, [coords]);

    const handleClose = () => navigation.goBack();

    const handleFocusRoute = () => {
        if (coords.length > 0 && mapRef.current) {
            mapRef.current.fitToCoordinates(coords, {
                edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
                animated: true,
            });
        }
    };

    const handleOpenShare = () => {
        if (!data?.routePolyline) {
            Alert.alert("알림", "지도 경로 데이터가 없어 코스로 공유할 수 없습니다.");
            return;
        }
        // 기본 이름 세팅
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
                // ✅ 변환된 실제 주소 사용
                address: address,
                latitude: startPoint.latitude,
                longitude: startPoint.longitude
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

    const blurredMapStyle = [
        { elementType: "geometry", stylers: [{ color: "#f0f0f0" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ visibility: "on" }, { color: "#ffffff" }, { weight: 1.5 }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9d1d9" }] },
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
                            {data?.mode === "GHOST" ? "고스트" : data?.mode === "TIER" ? "티어 측정" : "일반 측정"}
                            {"  ·  "}#{data?.recordId ?? "-"}
                        </Text>
                    </View>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose} activeOpacity={0.8}>
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
                                <Polyline coordinates={coords} strokeColor="rgba(0,0,0,0.1)" strokeWidth={16} />
                                <Polyline coordinates={coords} strokeColor="rgba(74,110,169,0.4)" strokeWidth={10} />
                                <Polyline coordinates={coords} strokeColor="rgba(120,160,220,0.5)" strokeWidth={6} />
                                <Polyline coordinates={coords} strokeColor="rgba(255,255,255,0.7)" strokeWidth={2} />
                                {startCoord && <Marker coordinate={startCoord}><View style={styles.markerCircle}><View style={[styles.markerInner, { backgroundColor: "#4CAF50" }]} /></View></Marker>}
                                {endCoord && <Marker coordinate={endCoord}><View style={styles.markerCircle}><View style={[styles.markerInner, { backgroundColor: "#FF3B30" }]} /></View></Marker>}
                            </MapView>
                            <TouchableOpacity style={styles.focusButton} onPress={handleFocusRoute}>
                                <MaterialCommunityIcons name="altimeter" size={22} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.mapPlaceholder}>
                            <Text style={styles.mapPlaceholderText}>{errorText ?? "경로 정보가 없거나 복원할 수 없어요."}</Text>
                        </View>
                    )}
                </View>

                {/* Info */}
                <View style={styles.infoContent}>
                    <View style={styles.grid}>
                        <View style={styles.card}>
                            <MaterialCommunityIcons name="map-marker-distance" size={22} color={colors.text} />
                            <Text style={styles.cardLabel}>거리</Text>
                            <Text style={styles.cardValue}>{(data?.distanceM ?? 0) / 1000}<Text style={styles.cardUnit}> km</Text></Text>
                        </View>
                        <View style={styles.card}>
                            <Ionicons name="time-outline" size={22} color={colors.text} />
                            <Text style={styles.cardLabel}>시간</Text>
                            <Text style={styles.cardValue}>{data?.timeText ?? "-"}</Text>
                        </View>
                        <View style={styles.card}>
                            <FontAwesome5 name="running" size={18} color={colors.text} />
                            <Text style={styles.cardLabel}>페이스</Text>
                            <Text style={styles.cardValue}>{data?.paceText ?? "-"}<Text style={styles.cardUnit}> /km</Text></Text>
                        </View>
                        <View style={styles.card}>
                            <Ionicons name="flame-outline" size={22} color={colors.text} />
                            <Text style={styles.cardLabel}>칼로리</Text>
                            <Text style={styles.cardValue}>{data?.calories ?? "-"}<Text style={styles.cardUnit}> kcal</Text></Text>
                        </View>
                        <View style={styles.card}>
                            <MaterialCommunityIcons name="shoe-print" size={22} color={colors.text} />
                            <Text style={styles.cardLabel}>케이던스</Text>
                            <Text style={styles.cardValue}>{Number.isFinite(Number(data?.cadence)) ? Math.round(Number(data?.cadence)) : 0}<Text style={styles.cardUnit}> spm</Text></Text>
                        </View>

                        {/* ✅ 코스 공유 버튼 */}
                        <TouchableOpacity
                            style={[styles.card, { backgroundColor: colors.tint, justifyContent: 'center', alignItems: 'center', borderColor: colors.tint }]}
                            onPress={handleOpenShare}
                        >
                            <Ionicons name="share-social" size={26} color="#fff" />
                            <Text style={{ marginTop: 6, color: "#fff", fontWeight: "800", fontSize: scaleFont(14, settings?.fontSize || 'MEDIUM') }}>
                                코스 공유
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* ✅ 공유 모달 */}
            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ width: '85%', backgroundColor: colors.card, borderRadius: 20, padding: 20, elevation: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 15, textAlign: 'center' }}>코스 공유하기 🚩</Text>

                        {/* ✅ 현재 주소 표시 */}
                        <Text style={{ color: colors.icon, fontSize: 12, marginBottom: 10, textAlign: 'center' }}>
                            📍 {address}
                        </Text>

                        <Text style={{ color: colors.text, marginBottom: 6, fontWeight: '600' }}>코스 이름</Text>
                        <TextInput
                            value={courseName}
                            onChangeText={setCourseName}
                            placeholder="예: 여의도 벚꽃 런"
                            placeholderTextColor={colors.icon}
                            style={{ backgroundColor: colors.background, color: colors.text, padding: 12, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: colors.border }}
                        />

                        <Text style={{ color: colors.text, marginBottom: 6, fontWeight: '600' }}>코스 설명</Text>
                        <TextInput
                            value={courseDesc}
                            onChangeText={setCourseDesc}
                            placeholder="코스에 대한 팁이나 특징을 적어주세요."
                            placeholderTextColor={colors.icon}
                            multiline
                            style={{ backgroundColor: colors.background, color: colors.text, padding: 12, borderRadius: 10, height: 80, marginBottom: 20, borderWidth: 1, borderColor: colors.border, textAlignVertical: 'top' }}
                        />

                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.background, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                                <Text style={{ color: colors.text, fontWeight: '600' }}>취소</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleSubmitShare} disabled={isUploading} style={{ flex: 1, padding: 14, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center' }}>
                                {isUploading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>공유하기</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

// ... (getStyles는 기존과 동일하므로 생략 가능, 전체 파일 덮어쓰기 시 맨 아래에 기존 코드를 유지해주세요)
export const getStyles = (
    scheme: "light" | "dark",
    fontSize: FontSizeSetting
) =>
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