import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { KAKAO_JAVASCRIPT_KEY } from '@env';

export interface CourseType {
    id: number;
    title: string;
    address: string;
    distance: string;
    imageUrl: string | null;
    isSaved: boolean;
}

interface CourseCardProps {
    course: CourseType;
    onToggle: () => void;
}

export default function CourseCard({ course, onToggle }: CourseCardProps) {
    if (!course) return null;

    const getMapHtml = () => {
        const safeAddress = course.address ? course.address.replace(/'/g, "\\'").replace(/\n/g, " ").trim() : "";

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&libraries=services"></script>
            <style>
                /* 전체 화면 꽉 채우기 */
                body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #E9ECEF; }
                #map { width: 100%; height: 100%; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                // ★ 핵심: SDK 로딩이 끝날 때까지 기다렸다가 실행
                kakao.maps.load(function() {
                    var mapContainer = document.getElementById('map');
                    var geocoder = new kakao.maps.services.Geocoder();
                    var address = '${safeAddress}';

                    if (address) {
                        geocoder.addressSearch(address, function(result, status) {
                            if (status === kakao.maps.services.Status.OK) {
                                var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                                
                                // ★ 가벼운 '이미지 지도(StaticMap)' 사용
                                var staticMapOption = { 
                                    center: coords,
                                    level: 3,
                                    marker: {
                                        position: coords
                                    }
                                };
                                
                                // 지도 그리기
                                var map = new kakao.maps.StaticMap(mapContainer, staticMapOption);
                            }
                        });
                    }
                });
            </script>
        </body>
        </html>
        `;
    };

    return (
        <View style={styles.card}>
            {/* 지도 영역 */}
            <View style={styles.imageContainer}>
                <WebView
                    originWhitelist={['*']}
                    source={{
                        html: getMapHtml(),
                        baseUrl: 'http://localhost'
                    }}
                    // 안드로이드 투명도 트릭 (깜빡임/렌더링 실패 방지)
                    style={{ flex: 1, opacity: 0.99 }}

                    // 리스트 성능을 위해 터치 막기
                    scrollEnabled={false}
                    pointerEvents="none"
                />
            </View>

            {/* 텍스트 영역 */}
            <View style={styles.textContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.title} numberOfLines={1}>{course.title}</Text>
                    <Text style={styles.distance}>{course.distance}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.address} numberOfLines={1}>📍 {course.address}</Text>
                    <Text onPress={onToggle} style={styles.heart}>
                        {course.isSaved ? '♥' : '♡'}
                    </Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    imageContainer: {
        width: '100%',
        height: 180, // 지도 높이 고정
        backgroundColor: '#E9ECEF',
    },
    textContainer: { padding: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#111', flex: 1, marginRight: 10 },
    distance: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    address: { fontSize: 14, color: '#888', flex: 1 },
    heart: { fontSize: 24, color: '#FF6B6B', fontWeight: 'bold', padding: 5, zIndex: 10 }
});