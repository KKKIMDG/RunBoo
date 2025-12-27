import React, { useEffect, useState } from 'react';
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
import { WebView } from 'react-native-webview';
import { KAKAO_JAVASCRIPT_KEY } from '@env';

// ✅ 백엔드 데이터 형태와 똑같이 정의 (로그 기반)
interface CourseDetailType {
    id: number;
    name: string;       // title -> name 으로 변경
    address: string;
    lengthKm: number;   // distance -> lengthKm (숫자) 으로 변경
    imageUrl: string | null;
    description?: string;
    isSaved?: boolean;  // 백엔드에서 안 넘어올 수도 있어서 ? 붙임
}

export default function CourseDetailScreen({ route, navigation }: any) {
    const { course }: { course: CourseDetailType } = route.params || {};
    const [loading, setLoading] = useState(true);

    // ✅ 하트 상태 관리 (기본값 false)
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (!course) {
            Alert.alert('오류', '코스 정보가 없습니다.');
            navigation.goBack();
        } else {
            setLoading(false);
            // 만약 서버에서 isSaved를 안 보내주면 기본 false, 보내주면 그 값 사용
            setIsSaved(!!course.isSaved);
        }
    }, [course]);

    const handleClose = () => {
        navigation.goBack();
    };

    // ✅ 하트 누르면 색깔 바뀌게 하는 함수
    const handleToggleHeart = () => {
        // 1. 화면상에서 즉시 색깔 변경 (사용자 경험 향상)
        const newState = !isSaved;
        setIsSaved(newState);

        // 2. (추후 구현) 여기서 서버로 찜하기 API를 보내야 저장이 유지됩니다.
        // 예: api.post(`/courses/${course.id}/like`);
    };

    const handleCopyAddress = async () => {
        if (course?.address) {
            await Clipboard.setStringAsync(course.address);
            Alert.alert('복사 완료', '주소가 클립보드에 복사되었습니다.');
        }
    };

    // ✅ 지도 HTML 생성 함수
    const getMapHtml = () => {
        const safeAddress = course.address
            ? course.address.replace(/'/g, "\\'").replace(/\n/g, ' ').trim()
            : '';

        return `
            <!DOCTYPE html>
            <html>
            <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              html, body { margin: 0; padding: 0; height: 100%; }
              #map { width: 100%; height: 100%; }
            </style>
            </head>
            <body>
            <div id="map"></div>
            <script>
            (function () {
              var script = document.createElement('script');
              script.src = 'https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&libraries=services&autoload=false';
              script.onload = function () {
                kakao.maps.load(function () {
                  var mapContainer = document.getElementById('map');
                  var mapOption = { center: new kakao.maps.LatLng(37.566826, 126.9786567), level: 3 };
                  var map = new kakao.maps.Map(mapContainer, mapOption);
                  var geocoder = new kakao.maps.services.Geocoder();
                  var address = '${safeAddress}';

                  if (address) {
                    geocoder.addressSearch(address, function (result, status) {
                      if (status === kakao.maps.services.Status.OK) {
                        var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                        new kakao.maps.Marker({ map: map, position: coords });
                        map.setCenter(coords);
                      }
                    });
                  }
                });
              };
              document.head.appendChild(script);
            })();
            </script>
            </body>
            </html>
        `;
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
                        {/* ✅ 수정됨: course.name 사용 */}
                        <Text style={styles.title} numberOfLines={1}>
                            {course.name}
                        </Text>
                        <Text style={styles.address} numberOfLines={1}>
                            📍 {course.address}
                        </Text>
                    </View>

                    <View style={styles.headerButtons}>
                        {/* ✅ 하트 버튼 추가 */}
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

                {/* Map */}
                <View style={styles.mapArea}>
                    {Platform.OS === 'web' ? (
                        <iframe
                            title="kakao-map"
                            srcDoc={getMapHtml()}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    ) : (
                        <WebView
                            originWhitelist={['*']}
                            source={{
                                html: getMapHtml(),
                                baseUrl: 'http://localhost' // 안드로이드 호환성 필수
                            }}
                            style={{ flex: 1 }}
                            javaScriptEnabled
                            domStorageEnabled
                        />
                    )}
                </View>

                {/* Info */}
                <View style={styles.infoContent}>
                    <View style={styles.badge}>
                        {/* ✅ 수정됨: course.lengthKm 사용 */}
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
    // 헤더 버튼들을 가로로 배치하기 위한 컨테이너
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