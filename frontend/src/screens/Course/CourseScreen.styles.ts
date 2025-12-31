import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
    // 1. 전체 컨테이너
    container: {
        flex: 1,
        backgroundColor: Colors[scheme].background,
    },

    // 2. 상단 헤더 영역
    header: {
        paddingHorizontal: 24,
        marginTop: 10,      // SafeAreaView 고려하여 간격 조정
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,            // 꽉 채우기
    },
    subHeader: {
        fontSize: 14,
        color: Colors[scheme].primary, // 포인트 컬러 사용 (아이콘 색상보다 눈에 띄게)
        fontWeight: '700',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    mainHeader: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors[scheme].text,
    },

    // 3. 필터 버튼(칩) 영역
    filterContainer: {
        marginBottom: 16,   // 리스트와 너무 멀지 않게 조정
    },

    // 4. ✅ [핵심] 리스트 스타일 (FlatList용)
    listContent: {
        paddingHorizontal: 24, // 양옆 여백
        paddingBottom: 80,     // 맨 아래 여백 (탭바 등에 가려지지 않게 넉넉히)
        paddingTop: 8,         // 필터와의 간격
    },

    // 5. ✅ [추가] 로딩 화면 스타일 (이게 있어야 뺑글이가 중앙에 옴)
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        // 화면 중앙보다 살짝 위가 보기 좋음
    },

    // 6. 데이터 없음(Empty) 스타일
    emptyListContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100, // 리스트 내부에서 중앙 쯤 오도록
    },
    emptyListText: {
        fontSize: 16,
        color: Colors[scheme].icon,
        textAlign: 'center',
        lineHeight: 24,
    },
});