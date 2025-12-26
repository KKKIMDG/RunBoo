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

interface CourseDetailType {
    id: number;
    name: string;
    address: string;
    lengthKm: number;
    imageUrl: string | null;
    description?: string;
}

export default function CourseDetailScreen({ route, navigation }: any) {
    const { course }: { course: CourseDetailType } = route.params || {};
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!course) {
            Alert.alert('오류', '코스 정보가 없습니다.');
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

    /**
     * ✅ 카카오맵 HTML
     * - autoload=false
     * - kakao.maps.load() 사용
     * - Web / WebView 공통 안정 패턴
     */
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
  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
  }
  #map {
    width: 100%;
    height: 100%;
  }
</style>
</head>

<body>
<div id="map"></div>

<script>
(function () {
  var script = document.createElement('script');
  script.src =
    'https://dapi.kakao.com/v2/maps/sdk.js' +
    '?appkey=${KAKAO_JAVASCRIPT_KEY}' +
    '&libraries=services' +
    '&autoload=false';

  script.onload = function () {
    kakao.maps.load(function () {

      var map = new kakao.maps.Map(
        document.getElementById('map'),
        {
          center: new kakao.maps.LatLng(37.566826, 126.9786567),
          level: 3
        }
      );

      var geocoder = new kakao.maps.services.Geocoder();
      var address = '${safeAddress}';

      if (address) {
        geocoder.addressSearch(address, function (result, status) {
          if (status === kakao.maps.services.Status.OK) {
            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            new kakao.maps.Marker({
              map: map,
              position: coords
            });

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
                        <Text style={styles.title} numberOfLines={1}>
                            {course.name}
                        </Text>
                        <Text style={styles.address} numberOfLines={1}>
                            📍 {course.address}
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.closeIconButton}
                        onPress={handleClose}
                    >
                        <Text style={styles.closeIconText}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* Map */}
                <View style={styles.mapArea}>
                    {Platform.OS === 'web' ? (
                        <iframe
                            title="kakao-map"
                            srcDoc={getMapHtml()}
                            style={{
                                width: '100%',
                                height: '100%',
                                border: 'none',
                            }}
                        />
                    ) : (
                        <WebView
                            originWhitelist={['*']}
                            source={{ html: getMapHtml() }}
                            style={{ flex: 1 }}
                            javaScriptEnabled
                            domStorageEnabled
                            startInLoadingState
                            renderLoading={() => (
                                <ActivityIndicator
                                    size="small"
                                    color="#3A4A98"
                                    style={{
                                        position: 'absolute',
                                        top: 100,
                                        left: '50%',
                                        marginLeft: -10,
                                    }}
                                />
                            )}
                        />
                    )}
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
    closeIconButton: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 20,
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeIconText: {
        color: '#fff',
        fontSize: 18,
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