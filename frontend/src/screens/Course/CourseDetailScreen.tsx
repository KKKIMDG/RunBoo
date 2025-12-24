import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { WebView } from 'react-native-webview';
import { KAKAO_JAVASCRIPT_KEY } from '@env';

interface CourseDetailType {
    id: number;
    name: string;
    address: string;
    lengthKm: number;
    imageUrl: string | null;
    description?: string;
}

export default function CourseDetailScreen({ route, navigation }: any) {
    const { course } = route.params || {};
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!course) {
            Alert.alert("오류", "코스 정보가 없습니다.");
            navigation.goBack();
        } else {
            setLoading(false);
        }
    }, [course]);

    const handleClose = () => {
        navigation.goBack();
    };

    const handleCopyAddress = async () => {
        if (course?.address) {
            await Clipboard.setStringAsync(course.address);
            Alert.alert('복사 완료', '주소가 클립보드에 복사되었습니다.');
        }
    };

    // ★ HTML 코드 생성 함수
    const getMapHtml = () => {
        // 주소 정제 (특수문자 제거)
        const safeAddress = course.address ? course.address.replace(/'/g, "\\'").replace(/\n/g, " ").trim() : "";

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&libraries=services"></script>
            <style>
                body { margin: 0; padding: 0; }
                #map { width: 100%; height: 100vh; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                // 1. 지도 생성
                var mapContainer = document.getElementById('map');
                var mapOption = {
                    center: new kakao.maps.LatLng(37.566826, 126.9786567), // 기본값(서울)
                    level: 3
                };
                var map = new kakao.maps.Map(mapContainer, mapOption);

                // 2. 주소 검색
                var addressToSearch = '${safeAddress}';
                
                // 0.5초 뒤에 검색 실행 (지도 로딩 안정화)
                setTimeout(function() {
                    if (!addressToSearch) return;

                    var geocoder = new kakao.maps.services.Geocoder();

                    geocoder.addressSearch(addressToSearch, function(result, status) {
                        if (status === kakao.maps.services.Status.OK) {
                            // 성공: 좌표로 이동 및 마커 표시
                            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                            var marker = new kakao.maps.Marker({
                                map: map,
                                position: coords
                            });
                            map.setCenter(coords);
                        } else {
                            // 실패: 원인을 알림창으로 띄움 (디버깅용)
                            // ZERO_RESULT: 주소가 이상함 / ERROR: 키 설정이나 네트워크 문제
                            window.ReactNativeWebView.postMessage("FAIL:" + status + ":" + addressToSearch);
                        }
                    });
                }, 500);
            </script>
        </body>
        </html>
        `;
    };

    if (loading || !course) {
        return <View style={styles.overlay}><ActivityIndicator size="large" color="#fff" /></View>;
    }

    return (
        <View style={styles.overlay}>
            <View style={styles.popupContainer}>
                <View style={styles.header}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.title} numberOfLines={1}>{course.title}</Text>
                        <Text style={styles.address} numberOfLines={1}>📍 {course.address}</Text>
                    </View>
                    <TouchableOpacity style={styles.closeIconButton} onPress={handleClose}>
                        <Text style={styles.closeIconText}>✕</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.mapArea}>
                    <WebView
                        originWhitelist={['*']}
                        source={{
                            html: getMapHtml(),
                            // ★ [핵심] 이 줄이 없으면 카카오 API가 작동을 거부할 수 있습니다!
                            baseUrl: 'http://localhost'
                        }}
                        style={{ flex: 1 }}
                        // 지도 내부에서 보낸 에러 메시지를 앱에서 받아서 경고창 띄우기
                        onMessage={(event) => {
                            const data = event.nativeEvent.data;
                            if (data.startsWith("FAIL")) {
                                const parts = data.split(":");
                                const status = parts[1];
                                if (status === 'ZERO_RESULT') {
                                    Alert.alert("주소 찾기 실패", "카카오맵에 등록되지 않은 주소입니다.");
                                } else {
                                    Alert.alert("지도 오류", "에러 코드: " + status);
                                }
                            }
                        }}
                        startInLoadingState={true}
                        renderLoading={() => (
                            <ActivityIndicator
                                size="small"
                                color="#3A4A98"
                                style={{ position: 'absolute', top: 100, left: '50%', marginLeft: -10 }}
                            />
                        )}
                        mixedContentMode="always"
                    />
                </View>

                <View style={styles.infoContent}>
                    <View style={styles.badge}>
                        <Text style={styles.distanceText}>🏃 총 거리 {course.distance}</Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.copyButton} onPress={handleCopyAddress}>
                    <Text style={styles.copyButtonText}>클립보드 복사 →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center', alignItems: 'center', padding: 20,
    },
    popupContainer: {
        backgroundColor: '#fff', width: '100%', height: '70%',
        borderRadius: 16, overflow: 'hidden',
    },
    header: {
        backgroundColor: '#2B3467', padding: 20,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    },
    title: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    address: { color: '#E5E7EB', fontSize: 13 },
    closeIconButton: {
        backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20,
        width: 30, height: 30, alignItems: 'center', justifyContent: 'center',
    },
    closeIconText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: -2 },
    mapArea: { width: '100%', flex: 1, backgroundColor: '#E5E7EB' },
    infoContent: { padding: 20, alignItems: 'flex-start' },
    badge: { backgroundColor: '#F3F4F6', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
    distanceText: { fontSize: 15, color: '#1F2937', fontWeight: '700' },
    copyButton: {
        backgroundColor: '#1F2937', padding: 16, alignItems: 'center',
        marginHorizontal: 20, marginBottom: 20, borderRadius: 10,
    },
    copyButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});