import { StyleSheet, Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const getStyles = (isDarkMode: boolean = false) => {
    const bgColor = isDarkMode ? '#121212' : '#F5F6F8'; // 전체 배경 (연한 회색)
    const cardColor = isDarkMode ? '#1E1E1E' : '#FFFFFF'; // 카드 배경 (흰색)
    const textColor = isDarkMode ? '#FFFFFF' : '#333333';
    const subTextColor = isDarkMode ? '#AAAAAA' : '#888888';
    const primaryColor = '#000000'; // 버튼 검은색
    const mapPlaceholderColor = isDarkMode ? '#333333' : '#EFEFEF';

    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: bgColor,
        },
        scrollContainer: {
            padding: 20,
            alignItems: 'center',
        },
        // --- 상단 프로필 영역 ---
        profileContainer: {
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 30,
        },
        profileImageContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: '#E0E0E0', // 프로필 이미지 없을 때 배경
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 10,
            overflow: 'hidden',
        },
        profileImage: {
            width: '100%',
            height: '100%',
        },
        titleText: {
            fontSize: 24,
            fontWeight: 'bold',
            color: textColor,
            marginBottom: 5,
        },
        subtitleText: {
            fontSize: 16,
            color: subTextColor,
            fontWeight: '600',
        },

        // --- 요약 통계 영역 (거리, 시간, 페이스) ---
        summaryContainer: {
            flexDirection: 'row',
            justifyContent: 'space-around',
            width: '100%',
            marginBottom: 30,
        },
        summaryItem: {
            alignItems: 'center',
        },
        summaryLabel: {
            fontSize: 14,
            color: subTextColor,
            marginTop: 8,
            marginBottom: 4,
        },
        summaryValue: {
            fontSize: 24,
            fontWeight: 'bold',
            color: textColor,
            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
        },
        summaryUnit: {
            fontSize: 12,
            color: subTextColor,
        },

        // --- 지도 영역 ---
        mapContainer: {
            width: width - 40,
            height: width - 40, // 정사각형
            backgroundColor: mapPlaceholderColor,
            borderRadius: 20,
            overflow: 'hidden',
            marginBottom: 30,
            justifyContent: 'center',
            alignItems: 'center',
            // 그림자
            ...Platform.select({
                ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
                android: { elevation: 5 },
            }),
        },
        map: {
            ...StyleSheet.absoluteFillObject,
        },
        mapPlaceholderText: {
            color: subTextColor,
            fontSize: 16,
        },
        logoContainer: {
            position: 'absolute',
            bottom: 15,
            right: 15,
        },
        logoImage: {
            width: 40,
            height: 40,
            resizeMode: 'contain',
        },

        // --- 버튼 영역 ---
        buttonContainer: {
            width: '100%',
            marginBottom: 30,
        },
        shareButton: {
            backgroundColor: primaryColor,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 18,
            borderRadius: 30,
            marginBottom: 15,
        },
        shareButtonText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: 'bold',
            marginLeft: 10,
        },
        homeButton: {
            backgroundColor: cardColor,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: 18,
            borderRadius: 30,
            borderWidth: 1,
            borderColor: isDarkMode ? '#333' : '#E0E0E0',
        },
        homeButtonText: {
            color: textColor,
            fontSize: 16,
            fontWeight: 'bold',
            marginLeft: 10,
        },

        // --- 하단 추가 정보 영역 (칼로리, 속도) ---
        bottomInfoContainer: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: '100%',
        },
        bottomInfoCard: {
            backgroundColor: cardColor,
            width: (width - 60) / 2, // 2등분
            padding: 20,
            borderRadius: 15,
        },
        bottomInfoLabel: {
            fontSize: 14,
            color: subTextColor,
            marginBottom: 10,
        },
        bottomInfoValue: {
            fontSize: 20,
            fontWeight: 'bold',
            color: textColor,
        },
    });
};