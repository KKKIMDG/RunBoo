import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors[scheme].background },

    // ▼▼▼ [여기 추가] FlatList에 적용할 스타일입니다 ▼▼▼
    listContent: {
        paddingHorizontal: 24, // 양옆 여백 (기존 courseList와 동일하게 맞춤)
        paddingBottom: 20      // 리스트 맨 아래 여백
    },
    // ▲▲▲ 추가 끝 ▲▲▲

    scrollContent: { paddingBottom: 20 }, // (FlatList로 바꿨으니 이제 안 쓰지만, 일단 둬도 됩니다)
    header: {
        paddingHorizontal: 24,
        marginTop: 20,
        marginBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerText: {
        marginLeft: 12,
        flex: 1,
    },
    subHeader: { fontSize: 12, color: Colors[scheme].icon, fontWeight: '600', marginBottom: 4 },
    mainHeader: { fontSize: 28, fontWeight: 'bold', color: Colors[scheme].text },
    filterContainer: { paddingHorizontal: 24, marginBottom: 24, flexDirection: 'row' },

    courseList: { paddingHorizontal: 24 }, // (이것도 이제 안 쓰지만, 일단 두셔도 됩니다)

    emptyListContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyListText: {
        color: Colors[scheme].icon,
    },
});