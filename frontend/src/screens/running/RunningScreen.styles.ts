import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const getStyles = (isDarkMode: boolean = false) => {
    const bgColor = isDarkMode ? '#121212' : '#F5F6F8'; // 전체 배경 (연한 회색)
    const cardColor = isDarkMode ? '#1E1E1E' : '#FFFFFF'; // 카드 배경 (흰색)
    const textColor = isDarkMode ? '#FFFFFF' : '#333333';
    const subTextColor = isDarkMode ? '#AAAAAA' : '#888888';
    const pointColorBlue = '#4A6EA9'; // 파란색 포인트
    const pointColorRed = '#FF3B30'; // 빨간색 포인트

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: bgColor,
        },
        scrollContainer: {
            padding: 20,
            paddingBottom: 100,
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
                ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
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
                ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } },
                android: { elevation: 3 },
            }),
        },

        // --- 정보 카드 영역 (시간, 거리, 페이스) ---
        statsContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 20,
        },
        statCard: {
            backgroundColor: cardColor,
            width: (width - 60) / 3, // 3등분
            paddingVertical: 20,
            alignItems: 'center',
            borderRadius: 15,
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
                android: { elevation: 5 },
            }),
        },
        statIconContainer: {
            marginBottom: 10,
        },
        statLabel: {
            fontSize: 14,
            color: subTextColor,
            marginBottom: 5,
        },
        statValueSmall: {
            fontSize: 20,
            fontWeight: 'bold',
            color: textColor,
            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        },
        statValueLarge: {
            fontSize: 28,
            fontWeight: 'bold',
            color: pointColorBlue,
        },
        statUnit: {
            fontSize: 12,
            color: subTextColor,
            marginTop: 5,
        },

        // --- 그래프 카드 영역 ---
        chartCard: {
            backgroundColor: cardColor,
            borderRadius: 15,
            padding: 20,
            marginBottom: 20,
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
                android: { elevation: 5 },
            }),
        },
        chartTitleContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 20,
        },
        chartTitle: {
            fontSize: 18,
            fontWeight: 'bold',
            color: textColor,
            marginLeft: 10,
        },
        chart: {
            marginVertical: 8,
            borderRadius: 16,
        },
        chartLabels: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 10,
        },
        chartLabelText: {
            fontSize: 12,
            color: subTextColor,
        },

        // --- 지도 영역 ---
        mapContainer: {
            height: 300,
            borderRadius: 15,
            overflow: 'hidden',
            marginBottom: 20,
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
                android: { elevation: 5 },
            }),
        },
        map: {
            ...StyleSheet.absoluteFillObject,
        },
        mapOverlay: {
            position: 'absolute',
            bottom: 20,
            alignSelf: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: 10,
        },
        mapOverlayText: {
            fontSize: 12,
            color: subTextColor,
        },

        // --- 하단 컨트롤 버튼 ---
        controlContainer: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: cardColor,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 20,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: -5 } },
                android: { elevation: 10 },
            }),
        },
        pauseButton: {
            backgroundColor: cardColor,
            width: 70,
            height: 70,
            borderRadius: 35,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 20,
            borderWidth: 2,
            borderColor: '#E0E0E0',
        },
        stopButton: {
            backgroundColor: pointColorRed,
            width: 80,
            height: 80,
            borderRadius: 25, // 네모난 모양
            justifyContent: 'center',
            alignItems: 'center',
            ...Platform.select({
                ios: { shadowColor: pointColorRed, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
                android: { elevation: 5 },
            }),
        },
        countdownOverlay: {
            ...StyleSheet.absoluteFillObject, // 화면 전체 덮기
            backgroundColor: bgColor, // 배경색과 동일하게
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100, // 가장 위에 표시
        },
        countdownText: {
            fontSize: 120, // 아주 크게!
            fontWeight: 'bold',
            color: pointColorBlue,
        },
        countdownLabel: {
            fontSize: 24,
            color: textColor,
            marginTop: 20,
        }
    });

};