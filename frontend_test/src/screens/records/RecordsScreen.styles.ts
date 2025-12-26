import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

// 스타일을 생성하는 함수로 변경
export const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
    // ScreenLayout에서 처리하므로 더 이상 사용되지 않지만, 호환성을 위해 남겨둡니다.
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 14,
        backgroundColor: Colors[scheme].background,
    },
    title: { 
        fontSize: 22, 
        fontWeight: "900", 
        color: Colors[scheme].text,
    },
    subTitle: { 
        marginTop: 4, 
        color: Colors[scheme].icon,
        fontWeight: "600",
    },
    center: { 
        flex: 1, 
        alignItems: "center", 
        justifyContent: "center",
        backgroundColor: Colors[scheme].background,
    },
    backButtonContainer: {
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    // 실제 RecordsScreen에서 사용되는 스타일들
    segmentedContainer: {
        marginTop: 12,
        marginBottom: 12,
    },
    errorContainer: {
        paddingVertical: 10,
    },
    errorText: {
        color: "#EF4444", // 에러 색상은 테마와 무관하게 유지
        fontWeight: "700",
    },
    emptyListContainer: {
        paddingTop: 40,
    },
    emptyListText: {
        textAlign: "center",
        color: Colors[scheme].icon, // 테마 적용
    },
    listContentContainer: {
        paddingBottom: 24,
    },
});
