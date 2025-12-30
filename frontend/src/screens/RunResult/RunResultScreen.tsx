import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, useColorScheme, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

import { getStyles } from './RunResultScreen.styles';
import { Coordinate } from '@/utils/runUtils';

// 이전 화면(Running)에서 받아올 데이터 타입 정의
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

    // --- 데이터 포맷팅 함수들 ---
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

    // 평균 속도 계산 (km/h)
    const avgSpeedKmh = distanceM > 0 && durationSec > 0 ? (distanceM / 1000) / (durationSec / 3600) : 0;

    const handleGoHome = () => {
        // 홈 화면으로 돌아가기 (스택 초기화)
        navigation.reset({
            index: 0,
            routes: [{ name: 'MainStack' as never }], // MainStack 이름 확인 필요
        });
    };

    const handleShare = () => {
        // TODO: 공유 기능 구현
        alert("기록 공유 기능 준비 중!");
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* 1. 프로필 영역 */}
                <View style={styles.profileContainer}>
                    <View style={styles.profileImageContainer}>
                        {/* TODO: 실제 유저 이미지 연동 */}
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
                            scrollEnabled={false} // 결과 화면이므로 스크롤 막음
                            zoomEnabled={false}
                            region={{
                                latitude: routeCoordinates[Math.floor(routeCoordinates.length / 2)].latitude,
                                longitude: routeCoordinates[Math.floor(routeCoordinates.length / 2)].longitude,
                                latitudeDelta: 0.02, // 적절한 줌 레벨 설정 필요
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

            </ScrollView>
        </SafeAreaView>
    );
};

export default RunResultScreen;