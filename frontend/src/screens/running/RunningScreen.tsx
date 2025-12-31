import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    useColorScheme,
    Dimensions,
    Alert,
    ToastAndroid,
    Platform
} from 'react-native';
import MapView, { Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { LineChart } from 'react-native-chart-kit';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

import { useRunningScreen } from './useRunningScreen';
import { getStyles } from './RunningScreen.styles';
// ✅ [추가] 새로 만든 StatBox 컴포넌트 임포트 (경로 확인해주세요!)
import { StatBox } from '@/components/StatBox';

const { width } = Dimensions.get('window');

const RunningScreen = () => {
    const isDarkMode = useColorScheme() === 'dark';
    const styles = getStyles(isDarkMode);

    const { state, actions, utils } = useRunningScreen();

    const {
        isRunning, isPaused, time, distance, currentPace,
        routeCoordinates, paceHistory,
        isReady, countdown
    } = state;

    const { pauseRun, resumeRun, stopRun } = actions;
    const { formatTime, formatPace } = utils;

    const handleStopPress = () => {
        if (Platform.OS === 'android') {
            ToastAndroid.show("종료하려면 버튼을 1초간 길게 누르세요", ToastAndroid.SHORT);
        } else {
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
            {/* 1. 카운트다운 오버레이 */}
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

                {/* 3. 정보 카드 영역 (✅ StatBox 컴포넌트로 교체하여 에러 해결!) */}
                <View style={styles.statsContainer}>
                    {/* 시간 */}
                    <StatBox
                        icon={<Ionicons name="time-outline" size={24} color="#4A6EA9" />}
                        label="시간"
                        value={formatTime(time)}
                    />

                    {/* 거리 (강조 표시) */}
                    <StatBox
                        icon={<MaterialCommunityIcons name="map-marker-distance" size={24} color="#4A6EA9" />}
                        label="거리"
                        value={(distance / 1000).toFixed(2)}
                        unit="km"
                        highlight={true}
                    />

                    {/* 페이스 */}
                    <StatBox
                        icon={<FontAwesome5 name="running" size={22} color="#4A6EA9" />}
                        label="페이스"
                        value={formatPace(currentPace)}
                        unit="/km"
                    />
                </View>

                {/* 4. 그래프 영역 */}
                <View style={styles.chartCard}>
                    <View style={styles.chartTitleContainer}>
                        <Ionicons name="analytics-outline" size={20} color={isDarkMode ? '#FFF' : '#333'} />
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

            {/* 6. 하단 컨트롤 버튼 */}
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

                <TouchableOpacity
                    style={styles.stopButton}
                    onPress={handleStopPress}
                    onLongPress={stopRun}
                    delayLongPress={1000}
                    activeOpacity={0.6}
                >
                    <View style={{ width: 24, height: 24, backgroundColor: 'white', borderRadius: 4 }} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default RunningScreen;