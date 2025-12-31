import { useState, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { useKeepAwake } from 'expo-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coordinate, getDistance, encodePath } from '@/utils/runUtils';
import { RootStackParamList } from '@/navigation/root/RootNavigator';

// 환경 변수
import { API_BASE_URL } from '@env';

type RunningScreenRouteProp = RouteProp<RootStackParamList, 'Running'>;
type RunningScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const useRunningScreen = () => {
    useKeepAwake();

    const navigation = useNavigation<RunningScreenNavigationProp>();
    const route = useRoute<RunningScreenRouteProp>();
    const targetDistance = route.params?.targetDistance || 0;
    const currentMode = route.params?.mode || "NORMAL";

    // --- 상태 관리 ---
    const [isReady, setIsReady] = useState(true);
    const [countdown, setCountdown] = useState(3);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [time, setTime] = useState(0);
    const [distance, setDistance] = useState(0);
    const [currentPace, setCurrentPace] = useState(0);
    const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]);
    const [paceHistory, setPaceHistory] = useState<number[]>([]);

    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    // --- 유틸리티 ---
    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const formatPace = (paceInSeconds: number) => {
        if (paceInSeconds === 0 || !isFinite(paceInSeconds)) return "-'--\"";
        const m = Math.floor(paceInSeconds / 60);
        const s = Math.floor(paceInSeconds % 60);
        return `${m}'${s < 10 ? '0' + s : s}"`;
    };

    // --- 로직 (Effect) ---
    useEffect(() => {
        if (isReady && countdown > 0) {
            countdownTimerRef.current = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (isReady && countdown === 0) {
            setIsReady(false);
            startRun();
        }
        return () => {
            if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
        };
    }, [isReady, countdown]);

    useEffect(() => {
        if (isRunning && !isPaused) {
            timerRef.current = setInterval(() => {
                setTime((prevTime) => {
                    const newTime = prevTime + 1;
                    if (distance > 0) {
                        const newPace = newTime / (distance / 1000);
                        setCurrentPace(newPace);
                        if (newTime % 5 === 0) {
                            setPaceHistory(prev => [...prev, newPace / 60]);
                        }
                    }
                    return newTime;
                });
            }, 1000);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [isRunning, isPaused, distance]);

    const startLocationTracking = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('권한 거부', '위치 권한이 필요합니다.');
            return;
        }

        locationSubscription.current = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.BestForNavigation,
                timeInterval: 1000,
                distanceInterval: 1,
            },
            (newLocation) => {
                const { latitude, longitude } = newLocation.coords;
                const newPoint: Coordinate = { latitude, longitude };

                setRouteCoordinates((prevRoute) => {
                    if (prevRoute.length > 0) {
                        const lastPoint = prevRoute[prevRoute.length - 1];
                        const dist = getDistance(
                            lastPoint.latitude, lastPoint.longitude,
                            latitude, longitude
                        );
                        if (dist > 0 && dist < 30) {
                            setDistance((prevDist) => prevDist + dist);
                        }
                    }
                    return [...prevRoute, newPoint];
                });
            }
        );
    };

    // --- 러닝 제어 ---
    const startRun = () => {
        setIsRunning(true);
        setIsPaused(false);
        startLocationTracking();
    };

    const pauseRun = () => {
        setIsPaused(true);
        if (locationSubscription.current) {
            locationSubscription.current.remove();
        }
    };

    const resumeRun = () => {
        setIsPaused(false);
        startLocationTracking();
    };

    const stopRun = async () => {
        // 1. 러닝 종료 처리
        setIsRunning(false);
        setIsPaused(false);
        if (timerRef.current) clearInterval(timerRef.current);
        if (locationSubscription.current) locationSubscription.current.remove();

        // 2. 데이터 계산
        const token = await AsyncStorage.getItem('accessToken');
        const userIdStr = await AsyncStorage.getItem('userId');
        const avgPaceSec = distance > 0 ? time / (distance / 1000) : 0;
        const calories = Math.floor(distance * 0.05);

        const requestData = {
            userId: userIdStr ? parseInt(userIdStr) : 0,
            mode: currentMode, // "NORMAL" or "TIER"
            distanceM: distance,
            durationSec: time,
            avgPace: Math.floor(avgPaceSec),
            calories: calories,
            routePolyline: encodePath(routeCoordinates),
            startedAt: new Date(Date.now() - time * 1000).toISOString(),
            endedAt: new Date().toISOString(),
        };

        // 3. 서버 전송
        let serverResult = null;
        try {
            const url = `${API_BASE_URL}/api/records`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData),
            });

            // 🔥 [수정] JSON 파싱 에러 방지 로직
            const textResponse = await response.text();
            try {
                serverResult = JSON.parse(textResponse);
                console.log("✅ 저장 완료(JSON):", serverResult);
            } catch (e) {
                console.log("⚠️ 저장 완료(Text):", textResponse);
                // JSON이 아니면 단순 텍스트 응답일 가능성 높음.
                // 티어 정보가 없으므로 NONE 처리
                serverResult = { tier: "NONE", message: textResponse };
            }

        } catch (error) {
            console.error("❌ 네트워크 에러:", error);
            Alert.alert("알림", "서버 연결에 실패하여 로컬 데이터로 결과를 표시합니다.");
        }

        // 4. 🔥 [수정] TierResultScreen용 데이터 포맷팅
        // (화면에 예쁘게 보여줄 문자열 데이터들)
        const formattedStats = {
            distance: (distance / 1000).toFixed(2), // "5.00"
            time: formatTime(time),                 // "30:00"
            pace: formatPace(avgPaceSec)            // "6'00""
        };

        // 5. 화면 이동
        if (currentMode === 'TIER') {
            // 🏆 티어 모드 -> TierResult 화면
            navigation.navigate('TierResult', {
                // ✅ 화면 표시용 (문자열)
                stats: formattedStats,

                // ✅ 로직용 (원본 데이터 + 티어 정보)
                achievedTier: serverResult?.tier || "NONE",
                distanceM: distance,
                durationSec: time,
                calories: calories,
                avgPaceSec: avgPaceSec,
                routeCoordinates: routeCoordinates,
            });
        } else {
            // 🏃‍♂️ 일반 모드 -> RunResult 화면
            navigation.navigate('RunResult', {
                distanceM: distance,
                durationSec: time,
                avgPaceSec: avgPaceSec,
                calories: calories,
                routeCoordinates: routeCoordinates,
            });
        }
    };

    return {
        state: { isReady, countdown, isRunning, isPaused, time, distance, currentPace, routeCoordinates, paceHistory, targetDistance },
        actions: { pauseRun, resumeRun, stopRun },
        utils: { formatTime, formatPace },
    };
};