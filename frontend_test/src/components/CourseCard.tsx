import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { KAKAO_JAVASCRIPT_KEY } from '@env';
import { Colors } from '@/constants/theme';

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
    scheme: 'light' | 'dark';
}

export default function CourseCard({ course, onToggle, scheme }: CourseCardProps) {
    if (!course) return null;

    const styles = getStyles(scheme);
    const colors = Colors[scheme];

    const getMapHtml = (backgroundColor: string) => {
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
                body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: ${backgroundColor}; }
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
                        html: getMapHtml(colors.secondaryBackground),
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

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
    card: {
        backgroundColor: Colors[scheme].card,
        borderRadius: 16,
        marginBottom: 16,
        elevation: scheme === 'light' ? 3 : 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: scheme === 'light' ? 0.1 : 0,
        shadowRadius: 8,
        overflow: 'hidden',
        borderWidth: scheme === 'dark' ? 1 : 0,
        borderColor: Colors[scheme].secondaryBackground,
    },
    imageContainer: {
        width: '100%',
        height: 180, // 지도 높이 고정
        backgroundColor: Colors[scheme].secondaryBackground,
    },
    textContainer: { padding: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    title: { fontSize: 18, fontWeight: 'bold', color: Colors[scheme].text, flex: 1, marginRight: 10 },
    distance: { fontSize: 16, fontWeight: 'bold', color: Colors[scheme].text },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    address: { fontSize: 14, color: Colors[scheme].icon, flex: 1 },
    heart: { fontSize: 24, color: '#FF6B6B', fontWeight: 'bold', padding: 5, zIndex: 10 }
});