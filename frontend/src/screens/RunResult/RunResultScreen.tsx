import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, useColorScheme, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

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

    // ✅ 앱 화면용(기존 유지)
    const shareRef = useRef<View>(null);

    // ✅ 스토리(9:16) 전용 캡처용 ViewShot ref
    const storyRef = useRef<any>(null);

    // ✅ 스토리 캡처용 "렌더 dp 박스"
    // - 최종 저장 해상도는 captureRef 옵션 1080x1920으로 고정
    const STORY_DP_W = 360;
    const STORY_DP_H = 640;

    // ✅ 노치/펀치홀 안전영역 패딩(스토리 이미지 내부에서 강제 확보)
    const STORY_SAFE_TOP = 48;
    const STORY_SAFE_BOTTOM = 42;

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

    // ✅ 지도 region 계산
    const midIdx = Math.floor(routeCoordinates.length / 2);
    const midCoord = routeCoordinates.length > 0 ? routeCoordinates[midIdx] : null;

    // ✅ 공유하기 (스토리 전용 ViewShot 캡처 → 공유)
    const handleShare = async () => {
        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (!isAvailable) {
                Alert.alert('알림', '이 기기에서는 공유 기능을 사용할 수 없습니다.');
                return;
            }

            // ✅ 오프스크린 지도 렌더 타이밍 안정화 (하얗게 나오는 케이스 방지)
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

            if (storyRef.current) {
                const uri = await captureRef(storyRef, {
                    format: 'png',
                    quality: 1.0,
                    result: 'tmpfile',
                    // ✅ 최종 저장 이미지를 인스타 스토리 표준 비율/해상도로 고정
                    width: 1080,
                    height: 1920,
                });

                await Sharing.shareAsync(uri, {
                    dialogTitle: '내 러닝 기록 공유하기',
                    mimeType: 'image/png',
                    UTI: 'image/png',
                });
            }
        } catch (error) {
            console.error('공유하기 실패:', error);
            Alert.alert('오류', '기록을 공유하는 중 문제가 발생했습니다.');
        }
    };

    /** ✅ 스토리 캡처 전용 UI */
    const StoryCapture = () => {
        const bg = isDarkMode ? '#070A12' : '#F6F7FB';
        const card = isDarkMode ? 'rgba(255,255,255,0.06)' : '#FFFFFF';
        const line = isDarkMode ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
        const subtle = isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)';
        const strong = isDarkMode ? '#FFFFFF' : '#111111';

        return (
            <View style={{ position: 'absolute', left: -99999, top: 0 }}>
                <ViewShot
                    ref={storyRef}
                    style={{
                        width: STORY_DP_W,
                        height: STORY_DP_H,
                        backgroundColor: bg,
                    }}
                >
                    <View
                        collapsable={false}
                        style={{
                            flex: 1,
                            backgroundColor: bg,
                            paddingTop: STORY_SAFE_TOP,
                            paddingBottom: STORY_SAFE_BOTTOM,
                            paddingHorizontal: 18,
                        }}
                    >
                        {/** 상단 헤더 */}
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 12,
                                gap: 12,
                            }}
                        >
                            <View
                                style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 10,
                                    backgroundColor: "transparent",
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    borderWidth: 0,
                                    borderColor: line,
                                }}
                            >
                                <Image
                                    source={require('@/assets/images/runboo.png')}
                                    style={{ width: 60, height: 60 }}
                                    resizeMode="contain"
                                />
                            </View>

                            <View style={{ alignItems: 'flex-start' }}>
                                <Text style={{ color: strong, fontSize: 18, fontWeight: '900' }}>
                                    런닝 완료
                                </Text>
                                <Text style={{ color: subtle, fontSize: 12, fontWeight: '700', marginTop: 2 }}>
                                    RunBoo!
                                </Text>
                            </View>
                        </View>


                        {/** 요약 카드 */}
                        <View
                            style={{
                                backgroundColor: card,
                                borderRadius: 20,
                                paddingVertical: 14,
                                paddingHorizontal: 12,
                                borderWidth: 1,
                                borderColor: line,
                                marginBottom: 14,
                            }}
                        >
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                {/* 거리 */}
                                <View style={{ width: '33%', alignItems: 'center', gap: 6 }}>
                                    <MaterialCommunityIcons name="map-marker-distance" size={20} color={iconColor} />
                                    <Text style={{ color: subtle, fontSize: 11, fontWeight: '800' }}>거리</Text>
                                    <Text style={{ color: strong, fontSize: 18, fontWeight: '900' }}>
                                        {(distanceM / 1000).toFixed(2)}
                                    </Text>
                                    <Text style={{ color: subtle, fontSize: 10, fontWeight: '800' }}>km</Text>
                                </View>

                                {/* 시간 */}
                                <View style={{ width: '33%', alignItems: 'center', gap: 6 }}>
                                    <Ionicons name="time-outline" size={20} color={iconColor} />
                                    <Text style={{ color: subtle, fontSize: 11, fontWeight: '800' }}>시간</Text>
                                    <Text style={{ color: strong, fontSize: 18, fontWeight: '900' }}>
                                        {formatTime(durationSec)}
                                    </Text>
                                    <Text style={{ color: subtle, fontSize: 10, fontWeight: '800' }}>분:초</Text>
                                </View>

                                {/* 페이스 */}
                                <View style={{ width: '33%', alignItems: 'center', gap: 6 }}>
                                    <FontAwesome5 name="running" size={18} color={iconColor} />
                                    <Text style={{ color: subtle, fontSize: 11, fontWeight: '800' }}>페이스</Text>
                                    <Text style={{ color: strong, fontSize: 18, fontWeight: '900' }}>
                                        {formatPace(avgPaceSec)}
                                    </Text>
                                    <Text style={{ color: subtle, fontSize: 10, fontWeight: '800' }}>/km</Text>
                                </View>
                            </View>
                        </View>

                        {/* 지도 카드 */}
                        <View
                            style={{
                                backgroundColor: card,
                                borderRadius: 22,
                                borderWidth: 1,
                                borderColor: line,
                                padding: 10,
                                marginBottom: 12,
                            }}
                        >
                            <View
                                style={{
                                    height: 255,
                                    borderRadius: 18,
                                    overflow: 'hidden',
                                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : '#F2F3F7',
                                    alignSelf: 'stretch',
                                }}
                            >
                                {routeCoordinates.length > 0 && midCoord ? (
                                    <MapView
                                        style={{ flex: 1 }}
                                        provider={PROVIDER_GOOGLE}
                                        scrollEnabled={false}
                                        zoomEnabled={false}
                                        region={{
                                            latitude: midCoord.latitude,
                                            longitude: midCoord.longitude,
                                            latitudeDelta: 0.02,
                                            longitudeDelta: 0.02,
                                        }}
                                    >
                                        <Polyline coordinates={routeCoordinates} strokeColor="#4A6EA9" strokeWidth={4} />
                                    </MapView>
                                ) : (
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                        <Text style={{ color: subtle, fontSize: 12, fontWeight: '800' }}>경로 정보가 없습니다.</Text>
                                    </View>
                                )}

                                {/* 지도 워터마크 */}
                                <View
                                    style={{
                                        position: 'absolute',
                                        right: 10,
                                        bottom: 10,
                                        paddingHorizontal: 10,
                                        paddingVertical: 6,
                                        borderRadius: 999,
                                        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.75)',
                                    }}
                                >
                                    <Text style={{ color: isDarkMode ? '#fff' : '#111', fontSize: 11, fontWeight: '900' }}>
                                        Run Boo
                                    </Text>
                                </View>
                            </View>
                        </View>

                        {/* 하단 정보 카드 */}
                        <View style={{ flexDirection: 'row', gap: 10, marginTop: 2 }}>
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: card,
                                    borderRadius: 18,
                                    borderWidth: 1,
                                    borderColor: line,
                                    paddingVertical: 12,
                                    paddingHorizontal: 12,
                                }}
                            >
                                <Text style={{ color: subtle, fontSize: 11, fontWeight: '900' }}>칼로리</Text>
                                <Text style={{ color: strong, fontSize: 16, fontWeight: '900', marginTop: 6 }}>
                                    {calories} <Text style={{ color: subtle, fontSize: 12, fontWeight: '900' }}>kcal</Text>
                                </Text>
                            </View>

                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: card,
                                    borderRadius: 18,
                                    borderWidth: 1,
                                    borderColor: line,
                                    paddingVertical: 12,
                                    paddingHorizontal: 12,
                                }}
                            >
                                <Text style={{ color: subtle, fontSize: 11, fontWeight: '900' }}>평균 속도</Text>
                                <Text style={{ color: strong, fontSize: 16, fontWeight: '900', marginTop: 6 }}>
                                    {avgSpeedKmh.toFixed(1)} <Text style={{ color: subtle, fontSize: 12, fontWeight: '900' }}>km/h</Text>
                                </Text>
                            </View>
                        </View>
                    </View>
                </ViewShot>
            </View>
        );
    };

    return (
        <SafeAreaView>
            {/* ✅ 스토리 캡처 전용 UI (오프스크린) */}
            <StoryCapture />

            {/* ✅ 실제 화면 UI (기존 정상 동작 유지) */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* ✅ 기존 캡처 영역(유지) - 지금 공유는 스토리 전용으로만 함 */}
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
                        {routeCoordinates.length > 0 && midCoord ? (
                            <MapView
                                style={styles.map}
                                provider={PROVIDER_GOOGLE}
                                scrollEnabled={false}
                                zoomEnabled={false}
                                region={{
                                    latitude: midCoord.latitude,
                                    longitude: midCoord.longitude,
                                    latitudeDelta: 0.02,
                                    longitudeDelta: 0.02,
                                }}
                            >
                                <Polyline coordinates={routeCoordinates} strokeColor="#4A6EA9" strokeWidth={4} />
                            </MapView>
                        ) : (
                            <Text style={styles.mapPlaceholderText}>경로 정보가 없습니다.</Text>
                        )}
                        <View style={styles.logoContainer}>
                            <Image source={require('@/assets/images/runboo.png')} style={styles.logoImage} />
                        </View>
                    </View>

                    {/* 5. 하단 추가 정보 영역 */}
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

                {/* 4. 버튼 영역 */}
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
