import { useState, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { useKeepAwake } from 'expo-keep-awake';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Coordinate, getDistance, encodePath } from '@/utils/runUtils';
// RootNavigator에서 정의한 타입 가져오기
import { RootStackParamList } from '@/navigation/root/RootNavigator';

// 네비게이션 타입 정의
type RunningScreenRouteProp = RouteProp<RootStackParamList, 'Running'>;
type RunningScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export const useRunningScreen = () => {
    useKeepAwake(); // 화면 꺼짐 방지

    // 네비게이션 & 라우트 훅
    const navigation = useNavigation<RunningScreenNavigationProp>();
    const route = useRoute<RunningScreenRouteProp>();

    // 목표 거리 가져오기 (없으면 0)
    const targetDistance = route.params?.targetDistance || 0;

    // --- 상태 관리 (State) ---
    // 1. 카운트다운 관련 상태
    const [isReady, setIsReady] = useState(true); // 준비 상태 (true면 카운트다운 중)
    const [countdown, setCountdown] = useState(3); // 3초 카운트다운

    // 2. 러닝 관련 상태
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [time, setTime] = useState(0); // 시간 (초)
    const [distance, setDistance] = useState(0); // 거리 (미터)
    const [currentPace, setCurrentPace] = useState(0); // 현재 페이스 (초/km)
    const [routeCoordinates, setRouteCoordinates] = useState<Coordinate[]>([]); // 지도 경로
    const [paceHistory, setPaceHistory] = useState<number[]>([]); // 그래프용 페이스 데이터

    // --- Refs (참조값) ---
    const locationSubscription = useRef<Location.LocationSubscription | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    // --- 유틸리티 함수 ---
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

    // --- 핵심 로직 (Effect) ---

    // 1. [카운트다운 로직]
    useEffect(() => {
        if (isReady && countdown > 0) {
            // 1초마다 카운트 감소
            countdownTimerRef.current = setTimeout(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (isReady && countdown === 0) {
            // 카운트가 0이 되면 준비 끝 -> 러닝 시작
            setIsReady(false);
            startRun();
        }

        return () => {
            if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
        };
    }, [isReady, countdown]);

    // 2. [타이머 & 페이스 계산 로직]
    useEffect(() => {
        if (isRunning && !isPaused) {
            timerRef.current = setInterval(() => {
                setTime((prevTime) => {
                    const newTime = prevTime + 1;

                    // 페이스 계산 (현재 속도 기반)
                    if (distance > 0) {
                        const newPace = newTime / (distance / 1000);
                        setCurrentPace(newPace);

                        // 5초마다 그래프 데이터 저장
                        if (newTime % 5 === 0) {
                            setPaceHistory(prev => [...prev, newPace / 60]); // 분 단위
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

    // 3. [위치 추적 함수]
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
                        // 튀는 값 필터링 (1초에 30m 이상 이동 시 무시)
                        if (dist > 0 && dist < 30) {
                            setDistance((prevDist) => prevDist + dist);
                        }
                    }
                    return [...prevRoute, newPoint];
                });
            }
        );
    };

    // --- 러닝 제어 핸들러 ---

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

        // 2. 최종 데이터 계산
        const avgPaceSec = distance > 0 ? time / (distance / 1000) : 0;
        const calories = Math.floor(distance * 0.05);

        // 3. 서버 전송 데이터 준비
        const userIdStr = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('accessToken'); // 토큰 가져오기 (필요시 사용)

        const requestData = {
            userId: userIdStr ? parseInt(userIdStr) : 0,
            mode: "NORMAL",
            distanceM: distance,
            durationSec: time,
            avgPace: Math.floor(avgPaceSec),
            calories: calories,
            routePolyline: encodePath(routeCoordinates),
            startedAt: new Date(Date.now() - time * 1000).toISOString(),
            endedAt: new Date().toISOString(),
        };

        console.log("LOG 저장할 데이터:", JSON.stringify(requestData));

        // ▼▼▼ 4. 서버 전송 (주석 해제 및 IP 수정) ▼▼▼
        try {
            // 🚨 주의: 본인 환경에 맞는 IP 주소를 쓰세요!
            // 안드로이드 에뮬레이터: 'http://10.0.2.2:8080/api/records'
            // 아이폰 시뮬레이터: 'http://localhost:8080/api/records'
            // 실제 핸드폰: 'http://192.168.x.x:8080/api/records' (컴퓨터 IP)

            const API_URL = 'http://20.20.10.37:8080/api/records';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // 스프링 시큐리티 쓰면 주석 해제
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                console.log("✅ DB 저장 성공!");
            } else {
                console.error("❌ DB 저장 실패:", await response.text());
                Alert.alert("저장 실패", "서버에 기록을 저장하지 못했습니다.");
            }
        } catch (error) {
            console.error("❌ 네트워크 에러:", error);
            Alert.alert("에러", "서버와 연결할 수 없습니다.");
        }

        // 5. 결과 화면으로 이동
        navigation.navigate('RunResult', {
            distanceM: distance,
            durationSec: time,
            avgPaceSec: avgPaceSec,
            calories: calories,
            routeCoordinates: routeCoordinates,
        });
    };

    // --- 반환 값 ---
    return {
        state: {
            isReady,        // 카운트다운 준비 상태
            countdown,      // 카운트다운 숫자
            isRunning,
            isPaused,
            time,
            distance,
            currentPace,
            routeCoordinates,
            paceHistory,
            targetDistance
        },
        actions: {
            // startRun은 카운트다운 끝나면 자동 호출되므로 내보낼 필요 X
            pauseRun,
            resumeRun,
            stopRun
        },
        utils: {
            formatTime,
            formatPace
        },
    };
};