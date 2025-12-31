import React, { useRef } from 'react'; // useRef 추가
import { View, Text, TouchableOpacity, Image, ScrollView, useColorScheme, Alert } from 'react-native'; // Alert 추가
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

// ✅ 공유 기능 라이브러리 임포트
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { getStyles } from './RunResultScreen.styles';
import { Coordinate } from '@/utils/runUtils';

type RunResultRouteParams = {
    distanceM: number;
    durationSec: number;
    avgPaceSec: number;
    calories: number;
    routeCoordinates: Coordinate[];
};

type RunResultRouteProp = RouteProp<{ params: RunResultRouteParams }, 'params'>;

const RunResultScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<RunResultRouteProp>();
    const { distanceM, durationSec, avgPaceSec, calories, routeCoordinates } = route.params;

    const isDarkMode = useColorScheme() === 'dark';
    const styles = getStyles(isDarkMode);
    const iconColor = isDarkMode ? '#FFFFFF' : '#333333';

    // ✅ 캡처할 영역을 지정하기 위한 Ref 생성
    const shareRef = useRef<View>(null);

    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const formatPace = (paceInSeconds: number) => {
        if (paceInSeconds === 0 || !isFinite(paceInSeconds)) return "-'--\"";
        const m = Math.floor(paceInSeconds / 60);
        const s = Math.floor(paceInSeconds % 60);
        return `${m}'${s < 10 ? '0' + s : s}"`;
    };

    const avgSpeedKmh = distanceM > 0 && durationSec > 0 ? (distanceM / 1000) / (durationSec / 3600) : 0;

    const handleGoHome = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainStack' as never }],
        });
    };

    // ✅ 공유하기 버튼 핸들러 (이미지 캡처 후 공유)
    const handleShare = async () => {
        try {
            // 1. 공유 가능한 상태인지 확인
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert("알림", "이 기기에서는 공유 기능을 사용할 수 없습니다.");
                return;
            }

            // 2. shareRef로 감싼 영역을 이미지로 캡처
            if (shareRef.current) {
                const uri = await captureRef(shareRef, {
                    format: 'png',
                    quality: 0.9, // 화질 설정 (0.0 ~ 1.0)
                    result: 'tmpfile',
                });

                // 3. 캡처된 이미지 공유
                await Sharing.shareAsync(uri, {
                    dialogTitle: '내 러닝 기록 공유하기',
                    mimeType: 'image/png',
                    UTI: 'image/png',
                });
            }
        } catch (error) {
            console.error("공유하기 실패:", error);
            Alert.alert("오류", "기록을 공유하는 중 문제가 발생했습니다.");
        }
    };

    return (
        <SafeAreaView>
            <ScrollView contentContainerStyle={styles.scrollContainer}>

                {/* ✅ 캡처하고 싶은 영역을 View로 감싸고 ref 연결 */}
                {/* collapsable={false}는 안드로이드 캡처 버그 방지용 */}
                <View ref={shareRef} collapsable={false} style={{ backgroundColor: isDarkMode ? '#000' : '#fff' }}>

                    {/* 1. 프로필 영역 */}
                    <View style={styles.profileContainer}>
                        <View style={styles.profileImageContainer}>
                            <Image source={require('@/assets/images/runboo.png')} style={styles.profileImage} resizeMode="cover" />
                        </View>
                        <Text style={styles.titleText}>러닝 완료!</Text>
                        <Text style={styles.subtitleText}>Run Boo!</Text>
                    </View>

                    {/* 2. 요약 통계 영역 */}
                    <View style={styles.summaryContainer}>
                        <View style={styles.summaryItem}>
                            <MaterialCommunityIcons name="map-marker-distance" size={28} color={iconColor} />
                            <Text style={styles.summaryLabel}>거리</Text>
                            <Text style={styles.summaryValue}>{(distanceM / 1000).toFixed(2)}</Text>
                            <Text style={styles.summaryUnit}>km</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Ionicons name="time-outline" size={28} color={iconColor} />
                            <Text style={styles.summaryLabel}>시간</Text>
                            <Text style={styles.summaryValue}>{formatTime(durationSec)}</Text>
                            <Text style={styles.summaryUnit}>분:초</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <FontAwesome5 name="running" size={24} color={iconColor} />
                            <Text style={styles.summaryLabel}>페이스</Text>
                            <Text style={styles.summaryValue}>{formatPace(avgPaceSec)}</Text>
                            <Text style={styles.summaryUnit}>/km</Text>
                        </View>
                    </View>

                    {/* 3. 지도 영역 */}
                    <View style={styles.mapContainer}>
                        {routeCoordinates.length > 0 ? (
                            <MapView
                                style={styles.map}
                                provider={PROVIDER_GOOGLE}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                region={{
                                    latitude: routeCoordinates[Math.floor(routeCoordinates.length / 2)].latitude,
                                    longitude: routeCoordinates[Math.floor(routeCoordinates.length / 2)].longitude,
                                    latitudeDelta: 0.02,
                                    longitudeDelta: 0.02,
                                }}
                            >
                                <Polyline
                                    coordinates={routeCoordinates}
                                    strokeColor="#4A6EA9"
                                    strokeWidth={4}
                                />
                            </MapView>
                        ) : (
                            <Text style={styles.mapPlaceholderText}>경로 정보가 없습니다.</Text>
                        )}
                        <View style={styles.logoContainer}>
                            <Image source={require('@/assets/images/runboo.png')} style={styles.logoImage} />
                        </View>
                    </View>

                    {/* 5. 하단 추가 정보 영역 (캡처에 포함하고 싶어서 위로 올림) */}
                    <View style={styles.bottomInfoContainer}>
                        <View style={styles.bottomInfoCard}>
                            <Text style={styles.bottomInfoLabel}>칼로리</Text>
                            <Text style={styles.bottomInfoValue}>{calories} kcal</Text>
                        </View>
                        <View style={styles.bottomInfoCard}>
                            <Text style={styles.bottomInfoLabel}>평균 속도</Text>
                            <Text style={styles.bottomInfoValue}>{avgSpeedKmh.toFixed(1)} km/h</Text>
                        </View>
                    </View>
                </View>
                {/* 캡처 영역 끝 */}

                {/* 4. 버튼 영역 (캡처에서 제외하기 위해 View 밖으로 뺌) */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.shareButton} onPress={handleShare} activeOpacity={0.8}>
                        <Ionicons name="share-social-outline" size={24} color="#FFF" />
                        <Text style={styles.shareButtonText}>기록 공유하기</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.homeButton} onPress={handleGoHome} activeOpacity={0.8}>
                        <Ionicons name="home-outline" size={24} color={iconColor} />
                        <Text style={styles.homeButtonText}>홈으로 돌아가기</Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

export default RunResultScreen;