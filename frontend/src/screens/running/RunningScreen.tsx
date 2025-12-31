import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
    Dimensions,
    Alert,
    ToastAndroid, // ✅ 안드로이드 토스트 메시지용
    Platform
} from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import { useRunningScreen } from './useRunningScreen';
import { getStyles } from './RunningScreen.styles';

const { width } = Dimensions.get('window');

const RunningScreen = () => {
    const isDarkMode = useColorScheme() === 'dark';
    const styles = getStyles(isDarkMode);

    const { state, actions, utils } = useRunningScreen();

    // 상태 값들 구조 분해 할당
    const {
        isRunning, isPaused, time, distance, currentPace,
        routeCoordinates, paceHistory,
        isReady, countdown
    } = state;

    const { pauseRun, resumeRun, stopRun } = actions;
    const { formatTime, formatPace } = utils;

    // ✅ [추가] 정지 버튼 탭 핸들러 (짧게 눌렀을 때)
    const handleStopPress = () => {
        if (Platform.OS === 'android') {
            ToastAndroid.show("종료하려면 버튼을 1초간 길게 누르세요", ToastAndroid.SHORT);
        } else {
            // iOS는 Toast가 없으므로 Alert로 대체 (혹은 별도 라이브러리 사용)
            Alert.alert("알림", "종료하려면 버튼을 길게 눌러주세요.");
        }
    };

    // 그래프 설정
    const chartConfig = {
        backgroundColor: isDarkMode ? '#1E1E1E' : '#ffffff',
        backgroundGradientFrom: isDarkMode ? '#1E1E1E' : '#ffffff',
        backgroundGradientTo: isDarkMode ? '#1E1E1E' : '#ffffff',
        decimalPlaces: 1,
        color: (opacity = 1) => `rgba(74, 110, 169, ${opacity})`,
        labelColor: (opacity = 1) => isDarkMode ? `rgba(255, 255, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: { r: '0' },
    };

    const chartData = {
        labels: [],
        datasets: [{
            data: paceHistory.length > 0 ? paceHistory : [0],
            color: (opacity = 1) => `rgba(74, 110, 169, ${opacity})`,
            strokeWidth: 2,
        }],
    };

    return (
        <View style={styles.container}>
            {/* 1. 카운트다운 오버레이 (준비 화면) */}
            {isReady && (
                <View style={styles.countdownOverlay}>
                    <Text style={styles.countdownText}>
                        {countdown > 0 ? countdown : "GO!"}
                    </Text>
                    <Text style={styles.countdownLabel}>준비하세요!</Text>
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* 2. 상단 헤더 */}
                <View style={styles.header}>
                    <View style={styles.statusTag}>
                        <View style={styles.statusDot} />
                        <Text style={styles.statusText}>{isPaused ? "일시정지" : "러닝 중"}</Text>
                    </View>
                    <TouchableOpacity style={styles.soundButton}>
                        <Ionicons name="volume-medium" size={24} color={isDarkMode ? '#FFF' : '#333'} />
                    </TouchableOpacity>
                </View>

                {/* 3. 정보 카드 영역 */}
                <View style={styles.statsContainer}>
                    {/* 시간 카드 */}
                    <View style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <Ionicons name="time-outline" size={24} color="#4A6EA9" />
                        </View>
                        <Text style={styles.statLabel}>시간</Text>
                        <Text style={styles.statValueSmall}>{formatTime(time)}</Text>
                    </View>
                    {/* 거리 카드 */}
                    <View style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <MaterialCommunityIcons name="map-marker-distance" size={24} color="#4A6EA9" />
                        </View>
                        <Text style={styles.statLabel}>거리</Text>
                        <Text style={styles.statValueLarge}>{(distance / 1000).toFixed(2)}</Text>
                        <Text style={styles.statUnit}>km</Text>
                    </View>
                    {/* 페이스 카드 */}
                    <View style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <FontAwesome5 name="running" size={24} color="#4A6EA9" />
                        </View>
                        <Text style={styles.statLabel}>페이스</Text>
                        <Text style={styles.statValueLarge}>{formatPace(currentPace)}</Text>
                        <Text style={styles.statUnit}>/km</Text>
                    </View>
                </View>

                {/* 4. 그래프 영역 */}
                <View style={styles.chartCard}>
                    <View style={styles.chartTitleContainer}>
                        <Ionicons name="analytics-outline" size={20} color="#4A6EA9" />
                        <Text style={styles.chartTitle}>페이스 변화</Text>
                    </View>
                    <LineChart
                        data={chartData}
                        width={width - 80}
                        height={150}
                        chartConfig={chartConfig}
                        bezier
                        style={styles.chart}
                        withInnerLines={false}
                        withOuterLines={false}
                        withVerticalLabels={false}
                        withHorizontalLabels={false}
                    />
                    <View style={styles.chartLabels}>
                        <Text style={styles.chartLabelText}>시작</Text>
                        <Text style={styles.chartLabelText}>현재: {formatPace(currentPace)}/km</Text>
                    </View>
                </View>

                {/* 5. 지도 영역 */}
                <View style={styles.mapContainer}>
                    <MapView
                        style={styles.map}
                        provider={PROVIDER_GOOGLE}
                        showsUserLocation={true}
                        followsUserLocation={true}
                        loadingEnabled={true}
                        region={routeCoordinates.length > 0 ? {
                            latitude: routeCoordinates[routeCoordinates.length - 1].latitude,
                            longitude: routeCoordinates[routeCoordinates.length - 1].longitude,
                            latitudeDelta: 0.005,
                            longitudeDelta: 0.005,
                        } : undefined}
                    >
                        <Polyline
                            coordinates={routeCoordinates}
                            strokeColor="#4A6EA9"
                            strokeWidth={5}
                        />
                    </MapView>
                    <View style={styles.mapOverlay}>
                        <Text style={styles.mapOverlayText}>실시간 경로</Text>
                    </View>
                </View>
            </ScrollView>

            {/* 6. 하단 컨트롤 버튼 (일시정지 / 종료) */}
            <View style={styles.controlContainer}>
                {isPaused ? (
                    <TouchableOpacity style={styles.pauseButton} onPress={resumeRun}>
                        <Ionicons name="play" size={36} color="#4A6EA9" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.pauseButton} onPress={pauseRun}>
                        <Ionicons name="pause" size={36} color="#4A6EA9" />
                    </TouchableOpacity>
                )}

                {/* 🔥 [수정됨] 길게 눌러야 종료되는 버튼 */}
                <TouchableOpacity
                    style={styles.stopButton}
                    onPress={handleStopPress}        // 1. 짧게 누르면 -> 안내 메시지
                    onLongPress={stopRun}            // 2. 길게 누르면 -> 진짜 종료
                    delayLongPress={1000}            // 3. 1초(1000ms) 이상 눌러야 인식됨
                    activeOpacity={0.6}
                >
                    {/* 종료 아이콘 (흰색 네모) */}
                    <View style={{ width: 24, height: 24, backgroundColor: 'white', borderRadius: 4 }} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RunningScreen;