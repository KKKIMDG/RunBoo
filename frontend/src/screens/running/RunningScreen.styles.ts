import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const getStyles = (isDarkMode: boolean = false) => {
    const bgColor = isDarkMode ? '#121212' : '#F5F6F8';
    const cardColor = isDarkMode ? '#1E1E1E' : '#FFFFFF';
    const textColor = isDarkMode ? '#FFFFFF' : '#333333';
    const subTextColor = isDarkMode ? '#AAAAAA' : '#888888';
    const pointColorBlue = '#4A6EA9';
    const pointColorRed = '#FF3B30';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: bgColor,
        },
        scrollContainer: {
            padding: 20,
            paddingBottom: 150, // 하단 버튼 공간 확보
        },

        // --- [필수] 카운트다운 오버레이 ---
        countdownOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: bgColor,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
        },
        countdownText: {
            fontSize: 120,
            fontWeight: 'bold',
            color: pointColorBlue,
            fontVariant: ['tabular-nums'],
        },
        countdownLabel: {
            fontSize: 24,
            fontWeight: '600',
            color: textColor,
            marginTop: 20,
        },

        // --- 상단 헤더 ---
        header: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
        },
        statusTag: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: cardColor,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 20,
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
                android: { elevation: 3 },
            }),
        },
        statusDot: {
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: pointColorBlue,
            marginRight: 8,
        },
        statusText: {
            fontSize: 16,
            fontWeight: 'bold',
            color: textColor,
        },
        soundButton: {
            backgroundColor: cardColor,
            padding: 8,
            borderRadius: 20,
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
                android: { elevation: 3 },
            }),
        },

        // --- 정보 카드 ---
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        statCard: {
            backgroundColor: cardColor,
            width: (width - 60) / 3,
            paddingVertical: 20,
            alignItems: 'center',
            borderRadius: 15,
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
                android: { elevation: 5 },
            }),
        },
        statIconContainer: { marginBottom: 10 },
        statLabel: { fontSize: 14, color: subTextColor, marginBottom: 5 },
        statValueSmall: {
            fontSize: 20,
            fontWeight: 'bold',
            color: textColor,
            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        },
        statValueLarge: { fontSize: 26, fontWeight: 'bold', color: pointColorBlue },
        statUnit: { fontSize: 12, color: subTextColor, marginTop: 5 },

        // --- 차트 영역 ---
        chartCard: {
            backgroundColor: cardColor,
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
                android: { elevation: 5 },
            }),
        },
        chartTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
        chartTitle: { fontSize: 18, fontWeight: 'bold', color: textColor, marginLeft: 10 },
        chart: { marginVertical: 8, borderRadius: 16 },
        chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
        chartLabelText: { fontSize: 12, color: subTextColor },

        // --- 지도 영역 ---
        mapContainer: {
            height: 300,
            borderRadius: 15,
            overflow: 'hidden',
            marginBottom: 20,
            backgroundColor: '#E0E0E0',
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
                android: { elevation: 5 },
            }),
        },
        map: { ...StyleSheet.absoluteFillObject },
        mapOverlay: {
            position: 'absolute',
            bottom: 20,
            alignSelf: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 20,
            elevation: 2,
        },
        mapOverlayText: { fontSize: 12, fontWeight: '600', color: '#333' },

        // --- 🔥 [에러 원인 해결] 하단 컨트롤 버튼 영역 ---
        controlContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: cardColor,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 30, // 터치 영역 넉넉하게
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 15, shadowOffset: { width: 0, height: -5 } },
                android: { elevation: 20 },
            }),
        },
        pauseButton: {
            backgroundColor: cardColor,
            width: 70,
            height: 70,
            borderRadius: 35,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 24,
            borderWidth: 1,
            borderColor: '#E0E0E0',
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
                android: { elevation: 3 },
            }),
        },
        stopButton: {
            backgroundColor: pointColorRed,
            width: 80,
            height: 80,
            borderRadius: 28, // 둥근 사각형
            justifyContent: 'center',
            alignItems: 'center',
            ...Platform.select({
                ios: { shadowColor: pointColorRed, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
                android: { elevation: 8 },
            }),
        },
    });
};