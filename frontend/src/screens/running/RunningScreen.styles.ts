// styles.ts
import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// 공통 색상 상수
const COLORS = {
    background: '#F8F9FA',
    white: '#FFFFFF',
    border: '#E9ECEF',
    textPrimary: '#000000',
    textSecondary: '#868E96',
    brand: '#2E3D6E', // 거리 강조 색상
};

export const styles = StyleSheet.create({
    // 전체 화면 레이아웃
    root: {
        flex: 1,
        backgroundColor: COLORS.background,
    },

    // 1. 상단 헤더 (러닝 중)
    headerContainer: {
        flexDirection: 'row',
        height: 60,
        paddingHorizontal: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.brand,
        opacity: 0.5,
    },
    headerText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    iconButton: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
    },

    // 2. 기록 정보 영역 (시간, 거리, 페이스)
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', // 3개 박스 균등 배치
        padding: 16,
    },
    // 개별 박스 (StatBox) 스타일
    statBox: {
        width: (width - 48) / 3, // (화면너비 - 여백) / 3등분
        padding: 16,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
        // 그림자 효과
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        gap: 4,
    },
    statLabel: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textPrimary,
        fontFamily: 'Consolas', // 숫자 등폭 폰트 추천
    },
    statValueHighlight: {
        color: COLORS.brand, // 거리 숫자만 파란색 강조
    },
    statUnit: {
        fontSize: 12,
        color: COLORS.textSecondary,
        marginTop: 2,
    },

    // 3. 그래프 영역
    chartContainer: {
        marginHorizontal: 16,
        padding: 20,
        borderRadius: 16,
        backgroundColor: COLORS.white,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    chartTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 8,
    },
    chartTitleText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textPrimary,
    },
    chartPlaceholder: {
        height: 100, // 그래프 들어갈 자리
        justifyContent: 'center',
        alignItems: 'center',
    },
    chartFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    chartFooterText: {
        fontSize: 10,
        color: COLORS.textSecondary,
    },

    // 4. 지도 영역 (남은 공간 채우기)
    mapContainer: {
        flex: 1, // 남은 공간 모두 차지
        marginVertical: 16,
        backgroundColor: '#E0E0E0', // 지도 로딩 전 회색 배경
        justifyContent: 'center',
        alignItems: 'center',
    },

    // 5. 하단 컨트롤 버튼
    controlBar: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20,
        gap: 20,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
    },
    controlButton: {
        width: 64,
        height: 64,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        backgroundColor: COLORS.white,
        // 그림자
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});