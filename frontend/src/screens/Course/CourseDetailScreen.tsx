import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// ✅ 데이터 타입 정의 (위도, 경도 추가)
interface CourseDetailType {
    id: number;
    name: string;
    address: string;
    lengthKm: number;
    imageUrl: string | null;
    description?: string;
    isSaved?: boolean;
    // [중요] 구글맵은 좌표가 필수입니다.
    latitude: number;
    longitude: number;
}

export default function CourseDetailScreen({ route, navigation }: any) {
    const { course }: { course: CourseDetailType } = route.params || {};
    const [loading, setLoading] = useState(true);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (!course) {
            Alert.alert('오류', '코스 정보가 없습니다.');
            navigation.goBack();
        } else {
            // 데이터가 로드되면 로딩 해제
            setLoading(false);
            setIsSaved(!!course.isSaved);
        }
    }, [course]);

    const handleClose = () => {
        navigation.goBack();
    };

    const handleToggleHeart = () => {
        setIsSaved(!isSaved);
        // TODO: API 호출 추가
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
                <ActivityIndicator size="large" color="#fff" />
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

                {/* [변경] MapView 영역 */}
                <View style={styles.mapArea}>
                    <MapView
                        style={{ flex: 1 }}
                        provider={PROVIDER_GOOGLE} // 구글맵 사용
                        initialRegion={{
                            latitude: course.latitude || 37.5665, // 데이터 없으면 서울시청
                            longitude: course.longitude || 126.9780,
                            latitudeDelta: 0.005, // 줌 레벨 (작을수록 확대)
                            longitudeDelta: 0.005,
                        }}
                    >
                        {/* 마커 표시 */}
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

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    popupContainer: {
        backgroundColor: '#fff',
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
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    address: {
        color: '#E5E7EB',
        fontSize: 13,
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
        fontSize: 18,
        fontWeight: 'bold',
    },
    heartIcon: {
        color: '#FF6B6B',
        fontSize: 20,
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
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    distanceText: {
        fontSize: 15,
        color: '#1F2937',
        fontWeight: '700',
    },
    copyButton: {
        backgroundColor: '#1F2937',
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 10,
    },
    copyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});