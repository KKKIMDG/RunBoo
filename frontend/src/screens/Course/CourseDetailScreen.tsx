import React, { useEffect, useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// ✅ API 및 훅 import
import { api } from '@/services/api';
import { Colors } from '@/constants/theme';
import { useMe } from '@/hooks/useMe';
import {useSettings} from "@/screens/Settings/useSettings";
import {FontSizeSetting, scaleFont} from "@/utils/fontScale";
import {useResolvedTheme} from "@/hooks/useResolvedTheme"; // ✅ 내 정보(userId) 가져오기 위해 추가

interface CourseDetailType {
    id: number;
    name: string;
    address: string;
    lengthKm: number;
    imageUrl: string | null;
    description?: string;
    isSaved?: boolean;
    latitude: number;
    longitude: number;
}

export default function CourseDetailScreen({ route, navigation }: any) {
    const { course }: { course: CourseDetailType } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    // ✅ 로그인 유저 정보 가져오기
    const { me } = useMe();

    const { settings } = useSettings();
    const colorScheme =  useResolvedTheme(settings?.themeMode);
    const styles = useMemo(() => {
        return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
    }, [colorScheme, settings?.fontSize]);

    const colors = Colors[colorScheme];
    useEffect(() => {
        if (!course) {
            Alert.alert('오류', '코스 정보가 없습니다.');
            navigation.goBack();
        } else {
            setLoading(false);
            setIsSaved(!!course.isSaved);
        }
    }, [course]);

    const handleClose = () => {
        navigation.goBack();
    };

    // ✅ [수정됨] API 명세서에 맞춘 토글 로직 (POST /api/user-courses/toggle)
    const handleToggleHeart = async () => {
        if (!me) {
            Alert.alert("알림", "로그인이 필요한 기능입니다.");
            return;
        }

        const originalState = isSaved;
        const newState = !isSaved;

        // 1. 화면 먼저 변경 (낙관적 업데이트)
        setIsSaved(newState);

        try {
            // 2. API 요청 (명세서 기준)
            // Endpoint: POST /api/user-courses/toggle
            // Body: { "userId": 1, "courseId": 1 }
            await api.post('/api/user-courses/toggle', {
                userId: me.userId,
                courseId: course.id
            });

            console.log(`찜하기 토글 성공: ${newState ? 'ON' : 'OFF'}`);

        } catch (error) {
            console.error("찜하기 변경 실패:", error);

            // 3. 실패 시 롤백 (원래 상태로 복구)
            setIsSaved(originalState);
            Alert.alert("오류", "찜하기 상태를 변경하지 못했습니다.");
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
                        style={{ flex: 1 }}
                        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
                        initialRegion={{
                            latitude: course.latitude || 37.5665,
                            longitude: course.longitude || 126.9780,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        }}
                    >
                        <Marker
                            coordinate={{
                                latitude: course.latitude || 37.5665,
                                longitude: course.longitude || 126.9780,
                            }}
                            title={course.name}
                            description={course.address}
                        />
                    </MapView>
                </View>

                {/* Info */}
                <View style={styles.infoContent}>
                    <View style={styles.badge}>
                        <Text style={styles.distanceText}>
                            🏃 총 거리 {course.lengthKm} km
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.copyButton}
                    onPress={handleCopyAddress}
                >
                    <Text style={styles.copyButtonText}>
                        클립보드 복사 →
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

export const getStyles = (
    scheme: "light" | "dark",
    fontSize: FontSizeSetting
    ) => {
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
            height: '70%',
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
        },
        badge: {
            backgroundColor: scheme === 'dark' ? '#333' : '#F3F4F6',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 6,
            alignSelf: 'flex-start',
        },
        distanceText: {
            fontSize: scaleFont(15, fontSize),
            color: colors.text,
            fontWeight: '700',
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