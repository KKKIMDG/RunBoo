import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
// ✅ WebView 제거, 구글 맵 추가
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '@/constants/theme';

// ✅ [정품 설명서] 좌표(latitude, longitude)가 꼭 있어야 합니다!
export interface CourseType {
    id: number;
    name: string;
    address: string;
    lengthKm: number;
    imageUrl: string | null;
    isSaved?: boolean;
    // ⚠️ 구글 맵을 위해 좌표 필수 추가
    latitude: number;
    longitude: number;
}

interface CourseCardProps {
    course: CourseType;
    onToggle: () => void;
    onPress: () => void;
    scheme: 'light' | 'dark';
}

export default React.memo(function CourseCard({ course, onToggle, onPress, scheme }: CourseCardProps) {
    if (!course) return null;

    const styles = getStyles(scheme);
    const colors = Colors[scheme];
    const isSaved = course.isSaved || false;

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
            {/* ✅ 지도 영역 (터치 무시하고 보기 전용으로 설정) */}
            <View style={styles.imageContainer} pointerEvents="none">
                <MapView
                    provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined} // iOS는 기본 맵, Android는 구글맵
                    style={{ flex: 1 }}
                    // ✅ [중요] 리스트 성능 최적화 (안드로이드에서 특히 중요)
                    liteMode={true}
                    initialRegion={{
                        latitude: course.latitude || 37.5665,
                        longitude: course.longitude || 126.9780,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                    }}
                    // ✅ 리스트 스크롤 방해 금지 (지도 조작 불가)
                    pitchEnabled={false}
                    rotateEnabled={false}
                    scrollEnabled={false}
                    zoomEnabled={false}
                >
                    <Marker
                        coordinate={{
                            latitude: course.latitude || 37.5665,
                            longitude: course.longitude || 126.9780,
                        }}
                    />
                </MapView>
            </View>

            <View style={styles.textContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.title} numberOfLines={1}>{course.name}</Text>
                    <Text style={styles.distance}>{course.lengthKm}km</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.address} numberOfLines={1}>📍 {course.address}</Text>
                    <TouchableOpacity onPress={onToggle} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        {/* 터치 이벤트가 겹치지 않게 pointerEvents="auto" 명시 */}
                        <View pointerEvents="auto">
                            <Text style={styles.heart}>{isSaved ? '♥' : '♡'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );
});

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
    card: {
        backgroundColor: Colors[scheme].card,
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',

        // ✅ [수정 1] 테두리(Border) 추가
        // 다크모드일 땐 0.5, 라이트모드일 땐 1 정도가 적당합니다.
        borderWidth: 1,
        // 테두리 색상: 다크모드는 어둡게, 라이트모드는 연한 회색(#E0E0E0) 추천
        borderColor: scheme === 'dark' ? '#333333' : '#E0E0E0',

        // ✅ [수정 2] 그림자(Shadow) 강화 (iOS + Android)
        // 안드로이드 그림자
        elevation: 4,
        // iOS 그림자 (이게 없으면 아이폰에서 납작해 보임)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1, // 그림자 진하기 (0 ~ 1)
        shadowRadius: 4,    // 그림자 퍼짐 정도
    },
    imageContainer: {
        width: '100%',
        height: 180,
        backgroundColor: Colors[scheme].secondaryBackground,
        // 이미지(지도) 아래쪽에 구분선 추가 (선택사항)
        borderBottomWidth: 1,
        borderBottomColor: scheme === 'dark' ? '#333333' : '#F0F0F0',
    },
    textContainer: {
        padding: 16,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors[scheme].text,
        flex: 1,
        marginRight: 10
    },
    distance: {
        fontSize: 16,
        fontWeight: 'bold',
        color: Colors[scheme].primary // 거리 강조를 위해 primary 색상 추천 (기존 text 유지 가능)
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    address: {
        fontSize: 14,
        color: Colors[scheme].icon,
        flex: 1
    },
    heart: {
        fontSize: 24,
        color: '#FF6B6B',
        fontWeight: 'bold'
    }
});