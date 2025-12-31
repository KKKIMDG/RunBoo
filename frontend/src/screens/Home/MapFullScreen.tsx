import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar } from 'react-native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function MapFullScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { location } = route.params || {}; // 홈 화면에서 넘겨준 위치 데이터

    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* 전체 화면 지도 */}
            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: location?.coords.latitude || 37.5665, // 데이터 없으면 서울 시청
                    longitude: location?.coords.longitude || 126.9780,
                    latitudeDelta: 0.005, // 홈 화면보다 좀 더 확대해서 보여줌
                    longitudeDelta: 0.005,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true} // 내 위치로 가기 버튼 활성화
            />

            {/* 뒤로가기 버튼 (상단 왼쪽) */}
            <SafeAreaView style={styles.headerContainer} pointerEvents="box-none">
                <TouchableOpacity
                    style={[styles.backButton, { backgroundColor: colors.card }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        width: '100%',
        height: '100%',
    },
    headerContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
        paddingTop: 10, // 상태바 고려
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        // 그림자 효과
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3.84,
        elevation: 5,
    }
});