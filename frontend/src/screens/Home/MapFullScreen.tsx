import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native'; // ✅ useIsFocused 추가
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// ✅ HomeScreen과 동일한 훅 가져오기
import { useNearbyRunners } from "@/hooks/useNearbyRunners";

export default function MapFullScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { location } = route.params || {};

    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    // ✅ 1. 화면이 포커스되었는지 확인
    const isFocused = useIsFocused();

    // ✅ 2. 훅을 통해 주변 러너 데이터 가져오기 (axios 로직 대체)
    const { nearbyRunners } = useNearbyRunners(isFocused);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: location?.coords.latitude || 37.5665,
                    longitude: location?.coords.longitude || 126.9780,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {/* ✅ 3. 주변 러너 마커 렌더링 */}
                {nearbyRunners.map((runner) => (
                    <Marker
                        key={runner.userId}
                        coordinate={{
                            latitude: runner.latitude,
                            longitude: runner.longitude,
                        }}
                        title={runner.nickname}
                        description={`${runner.nickname}님이 달리고 있어요!`}
                        anchor={{ x: 0.5, y: 0.5 }} // 마커 중심점 조정
                    >
                        {/* 커스텀 마커 UI */}
                        <View style={styles.markerContainer}>
                            {runner.profileImageUrl ? (
                                <Image
                                    source={{ uri: runner.profileImageUrl }}
                                    style={styles.markerImage}
                                />
                            ) : (
                                // 프로필 이미지가 없을 경우 기본 아이콘 표시
                                <Ionicons name="person" size={24} color="#4A90E2" />
                            )}
                        </View>
                    </Marker>
                ))}
            </MapView>

            {/* 뒤로가기 버튼 */}
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
    container: { flex: 1 },
    map: { width: '100%', height: '100%' },
    headerContainer: {
        position: 'absolute', top: 0, left: 0, right: 0,
        paddingHorizontal: 16, paddingTop: 10,
    },
    backButton: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: 'center', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2, shadowRadius: 3.84, elevation: 5,
    },
    // 마커 스타일 (HomeScreen보다 약간 더 크게 설정하여 가시성 확보)
    markerContainer: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#4A90E2', // 파란 테두리
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5,
    },
    markerImage: {
        width: 40, height: 40, borderRadius: 20,
        resizeMode: 'cover',
    }
});