
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors[scheme].background },
    scrollContent: { paddingBottom: 20 },
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
    courseList: { paddingHorizontal: 24 },
    emptyListContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyListText: {
        color: Colors[scheme].icon,
    },
});
