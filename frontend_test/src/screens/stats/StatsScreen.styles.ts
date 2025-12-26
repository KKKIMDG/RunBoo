
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 14,
        backgroundColor: Colors[scheme].background,
    },
    title: { 
        fontSize: 22, 
        fontWeight: "900", 
        color: Colors[scheme].text
    },
    subTitle: { 
        marginTop: 4, 
        color: Colors[scheme].icon, 
        fontWeight: "600" 
    },
    backButtonContainer: {
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    center: { 
        flex: 1, 
        alignItems: "center", 
        justifyContent: "center" 
    },
    segmentedContainer: {
        marginTop: 12,
        marginBottom: 12,
    },
    errorContainer: {
        paddingVertical: 10,
    },
    errorText: {
        color: "#EF4444",
        fontWeight: "700",
    },
    scrollViewFooter: {
        height: 24,
    },
});
