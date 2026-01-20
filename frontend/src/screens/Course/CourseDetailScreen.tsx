import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import polyline from '@mapbox/polyline';

// ✅ API 및 훅 import
import { api } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useMe } from '@/hooks/useMe';
import { useColorScheme } from '@/hooks/use-color-scheme'; // hooks 경로 확인
import { useSettings } from "@/screens/Settings/useSettings";
import { FontSizeSetting, scaleFont } from "@/utils/fontScale";
import { Course } from '@/types/course';
import {darkMapStyle, lightMapStyle} from "@/screens/Home/mapStyles"; // ✅ 타입 import (donggun 브랜치 기준)

export default function CourseDetailScreen({ route, navigation }: any) {
    const { course }: { course: Course } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(course?.isSaved ?? false);
    
    // ✅ 지도 제어용 Ref (자동 줌인 기능)
    const mapRef = useRef<MapView>(null);

    const { me } = useMe();
    const { settings } = useSettings();
    const colorScheme = useColorScheme() ?? "light";
    const colors = Colors[colorScheme];

    const styles = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);

    // ✅ 경로 데이터 디코딩 (pathData -> 좌표 배열)
    const routeCoordinates = useMemo(() => {
        if (!course?.pathData) return [];
        try {
            return polyline.decode(course.pathData).map((point) => ({
                latitude: point[0],
                longitude: point[1],
            }));
        } catch (e) {
            console.error("Polyline Decode Error:", e);
            return [];
        }
    }, [course]);

    useEffect(() => {
        if (!course) {
            Alert.alert('오류', '코스 정보가 없습니다.');
            navigation.goBack();
        } else {
            setLoading(false);
            if (course.isSaved !== undefined) {
                setIsSaved(course.isSaved);
            }
        }
    }, [course]);

    // ✅ 지도가 로드되면 경로가 보이도록 자동 이동 (Fit To Coordinates)
    useEffect(() => {
        if (routeCoordinates.length > 0 && mapRef.current) {
            setTimeout(() => {
                mapRef.current?.fitToCoordinates(routeCoordinates, {
                    edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                    animated: true,
                });
            }, 500);
        }
    }, [routeCoordinates]);

    const handleClose = () => {
        navigation.goBack();
    };

    const handleToggleHeart = async () => {
        if (!me) {
            Alert.alert("알림", "로그인이 필요한 기능입니다.");
            return;
        }

        const originalState = isSaved;
        const newState = !isSaved;
        setIsSaved(newState); // 낙관적 업데이트

        try {
            await api.post('/api/user-courses/toggle', {
                userId: me.userId,
                courseId: course.id
            });
            console.log(`찜하기 토글 성공: ${newState ? 'ON' : 'OFF'}`);
        } catch (error) {
            console.error("찜하기 실패:", error);
            setIsSaved(originalState); // 롤백
            Alert.alert("오류", "저장에 실패했습니다.");
        }
    };

    const handleCopyAddress = async () => {
        if (course?.address) {
            await Clipboard.setStringAsync(course.address);
            Alert.alert('복사 완료', '주소가 클립보드에 복사되었습니다.');
        }
    };

    if (loading || !course) {
        return (
            <View style={styles.overlay}>
                <ActivityIndicator size="large" color={colors.text} />
            </View>
        );
    }

    // 초기 지도 중심값 (경로가 있으면 첫 번째 좌표, 없으면 기본값)
    const initialLat = routeCoordinates.length > 0 ? routeCoordinates[0].latitude : (course.latitude || 37.5665);
    const initialLng = routeCoordinates.length > 0 ? routeCoordinates[0].longitude : (course.longitude || 126.9780);

    return (
        <View style={styles.overlay}>
            <View style={styles.popupContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.title} numberOfLines={1}>
                            {course.name}
                        </Text>
                        <Text style={styles.address} numberOfLines={1}>
                            📍 {course.address}
                        </Text>
                    </View>

                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={handleToggleHeart}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.heartIcon}>
                                {isSaved ? '♥' : '♡'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.iconButton, styles.closeButton]}
                            onPress={handleClose}
                        >
                            <Text style={styles.closeIconText}>✕</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* MapView 영역 */}
                <View style={styles.mapArea}>
                    <MapView
                        ref={mapRef} // ✅ Ref 연결
                        style={{ flex: 1 }}
                        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                        initialRegion={{
                            latitude: initialLat,
                            longitude: initialLng,
                            latitudeDelta: 0.015,
                            longitudeDelta: 0.015,
                        }}
                        customMapStyle={
                            colorScheme === "dark" ? darkMapStyle : lightMapStyle
                        }
                    >
                        {/* 시작점 마커 */}
                        <Marker
                            coordinate={{
                                latitude: initialLat,
                                longitude: initialLng,
                            }}
                            title="출발점"
                        />

                        {/* 🔥 경로 그리기 (Polyline) */}
                        <Polyline coordinates={routeCoordinates} strokeColor="rgba(0,0,0,0.1)" strokeWidth={16} />                                                                                                                                                                                                            │
                        <Polyline coordinates={routeCoordinates} strokeColor="rgba(74,110,169,0.4)" strokeWidth={10} />                                                                                                                                                                                                       │
                        <Polyline coordinates={routeCoordinates} strokeColor="rgba(120,160,220,0.5)" strokeWidth={6} />                                                                                                                                                                                                       │
                        <Polyline coordinates={routeCoordinates} strokeColor="rgba(255,255,255,0.7)" strokeWidth={2} />
                    </MapView>
                </View>

                {/* Info Content */}
                <View style={styles.infoContent}>
                    <View style={styles.statsRow}>
                        <View style={styles.badge}>
                            <Text style={styles.distanceText}>
                                🏃 {course.lengthKm} km
                            </Text>
                        </View>
                        <View style={[styles.badge, { marginLeft: 8 }]}>
                            <Text style={styles.distanceText}>
                                ❤️ {course.saveCount}명이 저장함
                            </Text>
                        </View>
                    </View>

                    {/* 설명글 (스크롤 가능하게) */}
                    <ScrollView style={{ maxHeight: 100, marginTop: 12 }}>
                        <Text style={styles.descriptionText}>
                            {course.description || "코스 설명이 없습니다."}
                        </Text>
                    </ScrollView>
                </View>

                <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopyAddress}
                >
                    <Text style={styles.copyButtonText}>
                        주소 복사하기
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// 스타일 정의
export const getStyles = (scheme: "light" | "dark", fontSize: FontSizeSetting) => {
    const colors = Colors[scheme];

    return StyleSheet.create({
        overlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.6)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        popupContainer: {
            backgroundColor: colors.background,
            width: '100%',
            height: '75%',
            borderRadius: 16,
            overflow: 'hidden',
        },
        header: {
            backgroundColor: '#2B3467',
            padding: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        title: {
            fontSize: scaleFont(20, fontSize),
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: 4,
        },
        address: {
            color: '#E5E7EB',
            fontSize: scaleFont(13, fontSize),
        },
        headerButtons: {
            flexDirection: 'row',
            gap: 8,
        },
        iconButton: {
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: 20,
            width: 36,
            height: 36,
            alignItems: 'center',
            justifyContent: 'center',
        },
        closeButton: {
            backgroundColor: 'rgba(255,255,255,0.1)',
            marginLeft: 8,
        },
        closeIconText: {
            color: '#fff',
            fontSize: scaleFont(18, fontSize),
            fontWeight: 'bold',
        },
        heartIcon: {
            color: '#FF6B6B',
            fontSize: scaleFont(20, fontSize),
            fontWeight: 'bold',
        },
        mapArea: {
            width: '100%',
            flex: 1,
            backgroundColor: '#E5E7EB',
        },
        infoContent: {
            padding: 20,
            paddingBottom: 10,
        },
        statsRow: {
            flexDirection: 'row',
            alignItems: 'center',
        },
        badge: {
            backgroundColor: scheme === 'dark' ? '#333' : '#F3F4F6',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 6,
            alignSelf: 'flex-start',
        },
        distanceText: {
            fontSize: scaleFont(14, fontSize),
            color: colors.text,
            fontWeight: '600',
        },
        descriptionText: {
            fontSize: scaleFont(14, fontSize),
            color: colors.text,
            lineHeight: 20,
        },
        copyButton: {
            backgroundColor: scheme === 'dark' ? '#4B5563' : '#1F2937',
            padding: 16,
            alignItems: 'center',
            marginHorizontal: 20,
            marginBottom: 20,
            borderRadius: 10,
        },
        copyButtonText: {
            color: '#fff',
            fontSize: scaleFont(16, fontSize),
            fontWeight: 'bold',
        },
    });
};