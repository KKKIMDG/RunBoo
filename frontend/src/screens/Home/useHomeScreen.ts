import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

export type RunningMode = '측정' | '티어' | '고스트';

// 네비게이션 타입 정의 (Running 화면으로 targetDistance 전달)
type RootStackParamList = {
    Running: { targetDistance: number };
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
        setIsGoalPickerOpen(false); // 선택 후 닫기
    };

    const handleStartRun = () => {
        // 목표 거리(m)를 가지고 Running 화면으로 이동
        navigation.navigate('Running', {
            targetDistance: selectedGoal.value
        });
    };

    return {
        activeMode,
        handleModeChange,
        // 추가된 반환값들
        isGoalPickerOpen,
        selectedGoal,
        goalOptions,
        toggleGoalPicker,
        handleSelectGoal,
        handleStartRun,
    };
};