import { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location'; // [추가]

export type RunningMode = '측정' | '티어' | '고스트';

type RootStackParamList = {
    Running: { targetDistance: number };
    MapFull: { location: Location.LocationObject | null }; // 추가됨
};

export const useHomeScreen = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

    // 1. 모드 상태
    const [activeMode, setActiveMode] = useState<RunningMode>('측정');

    // 2. 목표 설정 상태
    const [isGoalPickerOpen, setIsGoalPickerOpen] = useState(false);
    const [selectedGoal, setSelectedGoal] = useState<{ label: string; value: number }>({
        label: '목표 설정',
        value: 0,
    });
    const handleOpenFullMap = () => {
        if (location) {
            navigation.navigate('MapFull', { location });
        } else {
            console.log("위치 정보가 없어서 지도를 열 수 없습니다.");
        }
    };

    // 3. [추가] 위치 정보 상태
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // [추가] 초기 위치 가져오기
    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setErrorMsg('위치 권한이 거부되었습니다.');
                return;
            }

            let currentLocation = await Location.getCurrentPositionAsync({});
            setLocation(currentLocation);
        })();
    }, []);

    // 목표 옵션 리스트
    const goalOptions = [
        { label: '목표 없음', value: 0 },
        { label: '3km 목표', value: 3000 },
        { label: '5km 목표', value: 5000 },
        { label: '10km 목표', value: 10000 },
    ];

    // --- 핸들러 ---
    const handleModeChange = (mode: RunningMode) => {
        setActiveMode(mode);
    };

    const toggleGoalPicker = () => {
        setIsGoalPickerOpen(!isGoalPickerOpen);
    };

    const handleSelectGoal = (goal: { label: string; value: number }) => {
        setSelectedGoal(goal);
        setIsGoalPickerOpen(false);
    };

    const handleStartRun = () => {
        navigation.navigate('Running', {
            targetDistance: selectedGoal.value
        });
    };

    return {
        activeMode,
        handleModeChange,
        isGoalPickerOpen,
        selectedGoal,
        goalOptions,
        toggleGoalPicker,
        handleSelectGoal,
        handleStartRun,
        location, // [추가] 반환
        errorMsg,  // [추가] 반환
        handleOpenFullMap
    };
};