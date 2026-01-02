import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, StatusBar, Image, Alert } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://20.20.10.37:8080';

export default function MapFullScreen() {
    const navigation = useNavigation();
    const route = useRoute<any>();
    const { location } = route.params || {};

    const colorScheme = useColorScheme() ?? 'light';
    const colors = Colors[colorScheme];

    // 홈 화면처럼 주변 러너들을 저장할 상태
    const [nearbyRunners, setNearbyRunners] = useState<any[]>([]);

    // 1. 주변 러너 가져오는 함수 (홈 화면 로직과 동일)
    const fetchNearbyRunners = async () => {
        if (!location) return;

        try {
            // 토큰 가져오기 (키 이름이 'accessToken'이 아니면 홈 화면과 똑같이 맞추세요)
            const token = await AsyncStorage.getItem('accessToken');

            // API 호출
            const response = await axios.post(
                `${API_BASE_URL}/api/runners/nearby`,
                {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    radius: 5.0 // 전체 화면이니까 반경을 좀 더 넓게(5km) 잡아도 좋습니다
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // 토큰 헤더 추가
                    },
                }
            );

            // 데이터가 잘 오면 상태에 저장
            if (response.data) {
                setNearbyRunners(response.data);
            }

        } catch (error) {
            // 에러가 나면 조용히 로그만 찍음 (사용자 방해 X)
            console.log('MapFullScreen 러너 조회 실패:', error);
        }
    };

    // 2. 화면 들어오면 실행 & 3초마다 갱신 (홈 화면과 동일)
    useEffect(() => {
        fetchNearbyRunners();

        const interval = setInterval(fetchNearbyRunners, 3000);
        return () => clearInterval(interval);
    }, [location]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                initialRegion={{
                    latitude: location?.coords.latitude || 37.5665,
                    longitude: location?.coords.longitude || 126.9780,
                    latitudeDelta: 0.01, // 조금 더 넓게 보기
                    longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
            >
                {/* 3. 받아온 러너 리스트를 지도에 마커로 뿌리기 */}
                {nearbyRunners.map((runner) => (
                    <Marker
                        key={runner.userId}
                        coordinate={{
                            latitude: runner.latitude,
                            longitude: runner.longitude,
                        }}
                        title={runner.nickname}
                    >
                        {/* 커스텀 마커 UI (프사 둥글게) */}
                        <View style={styles.markerContainer}>
                            <Image
                                source={{ uri: runner.profileImageUrl || 'https://via.placeholder.com/50' }}
                                style={styles.markerImage}
                            />
                        </View>
                    </Marker>
                ))}
            </MapView>

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
    // 마커 스타일
    markerContainer: {
        width: 44, height: 44, borderRadius: 22,
        backgroundColor: 'white',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 2, borderColor: '#4A90E2', // 파란 테두리
        overflow: 'hidden',
    },
    markerImage: {
        width: 40, height: 40, borderRadius: 20,
        resizeMode: 'cover',
    }
});