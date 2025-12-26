import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { KAKAO_JAVASCRIPT_KEY } from '@env';
import { Colors } from '@/constants/theme';

// ✅ [정품 설명서] 여기서 정의하고 다른 파일들은 이걸 가져다 써야 함
export interface CourseType {
    id: number;
    name: string;        // 백엔드: name
    address: string;
    lengthKm: number;    // 백엔드: lengthKm
    imageUrl: string | null;
    isSaved?: boolean;
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

    const getMapHtml = (backgroundColor: string) => {
        const safeAddress = course.address
            ? course.address.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, " ").trim()
            : "";

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JAVASCRIPT_KEY}&libraries=services"></script>
            <style>
                body, html { margin: 0; padding: 0; width: 100%; height: 100%; background-color: ${backgroundColor}; }
                #map { width: 100%; height: 100%; }
            </style>
        </head>
        <body>
            <div id="map"></div>
            <script>
                kakao.maps.load(function() {
                    var mapContainer = document.getElementById('map');
                    var geocoder = new kakao.maps.services.Geocoder();
                    var address = '${safeAddress}';

                    if (address) {
                        geocoder.addressSearch(address, function(result, status) {
                            if (status === kakao.maps.services.Status.OK) {
                                var coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                                var staticMapOption = { 
                                    center: coords,
                                    level: 3,
                                    marker: { position: coords }
                                };
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
        <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
            <View style={styles.imageContainer}>
                <WebView
                    originWhitelist={['*']}
                    source={{ html: getMapHtml(colors.secondaryBackground), baseUrl: 'http://localhost' }}
                    style={{ flex: 1, opacity: 0.99 }}
                    scrollEnabled={false}
                    pointerEvents="none"
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    androidLayerType="software"
                />
            </View>
            <View style={styles.textContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.title} numberOfLines={1}>{course.name}</Text>
                    <Text style={styles.distance}>{course.lengthKm}km</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.address} numberOfLines={1}>📍 {course.address}</Text>
                    <TouchableOpacity onPress={onToggle} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                        <Text style={styles.heart}>{isSaved ? '♥' : '♡'}</Text>
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
        borderWidth: scheme === 'dark' ? 1 : 0,
        borderColor: Colors[scheme].secondaryBackground,
        elevation: 3,
    },
    imageContainer: { width: '100%', height: 180, backgroundColor: Colors[scheme].secondaryBackground },
    textContainer: { padding: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    title: { fontSize: 18, fontWeight: 'bold', color: Colors[scheme].text, flex: 1, marginRight: 10 },
    distance: { fontSize: 16, fontWeight: 'bold', color: Colors[scheme].text },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    address: { fontSize: 14, color: Colors[scheme].icon, flex: 1 },
    heart: { fontSize: 24, color: '#FF6B6B', fontWeight: 'bold' }
});