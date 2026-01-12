import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import * as Location from "expo-location";
import { RootStackParamList } from "@/navigation/root/RootNavigator"; // 경로 확인 필요

export type RunningMode = "측정" | "티어" | "고스트";

export const useHomeScreen = () => {
  // ✅ RootStackParamList를 사용하는 네비게이션 타입 지정
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  // 1. 모드 상태
  const [activeMode, setActiveMode] = useState<RunningMode>("측정");

  // 2. [측정 모드] 목표 설정 상태
  const [isGoalPickerOpen, setIsGoalPickerOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<{
    label: string;
    value: number;
  }>({
    label: "목표 설정",
    value: 0,
  });

  // 3. [티어 모드] 상태 (🔥🔥 HomeScreen에서 여기로 이사옴!)
  const [isTierPickerOpen, setIsTierPickerOpen] = useState(false);
  const [tierDistance, setTierDistance] = useState<"5km" | "10km">("5km");

  // 4. 위치 정보 상태
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 초기 위치 가져오기
  useEffect(() => {
    (async () => {
      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
    })();
  }, []);

  // 목표 옵션 리스트
  const goalOptions = [
    { label: "목표 없음", value: 0 },
    { label: "3km 목표", value: 3000 },
    { label: "5km 목표", value: 5000 },
    { label: "10km 목표", value: 10000 },
  ];

  // --- 핸들러 ---

  const handleModeChange = (mode: RunningMode) => {
    setActiveMode(mode);
  };

  // [측정 모드] 핸들러
  const toggleGoalPicker = () => setIsGoalPickerOpen(!isGoalPickerOpen);
  const handleSelectGoal = (goal: { label: string; value: number }) => {
    setSelectedGoal(goal);
    setIsGoalPickerOpen(false);
  };
  const handleStartRun = () => {
    navigation.navigate("Running", {
      targetDistance: selectedGoal.value,
      mode: "NORMAL", // ✅ 이제 에러 안 남
    });
  };

  // [티어 모드] 핸들러 (🔥🔥 추가됨)
  const toggleTierPicker = () => setIsTierPickerOpen(!isTierPickerOpen);
  const handleSelectTierDistance = (distance: "5km" | "10km") => {
    setTierDistance(distance);
    setIsTierPickerOpen(false);
  };
  const handleStartTierRun = () => {
    // 목표 거리에 따라 m단위 변환
    const distMeters = tierDistance === "10km" ? 10000 : 5000;

    // ✅ 'Running'이 아니라 'TierRunning'으로 내비게이션
    navigation.navigate("TierRunning", {
      targetDistance: distMeters,
      mode: "TIER",
      distanceType: tierDistance, // "5km" 또는 "10km" 전달
    });
  };

  // 지도 자세히 보기
  const handleOpenFullMap = () => {
    if (location) {
      navigation.navigate("MapFull", { location });
    }
  };

  return {
    activeMode,
    handleModeChange,

    // 측정 모드 관련
    isGoalPickerOpen,
    selectedGoal,
    goalOptions,
    toggleGoalPicker,
    handleSelectGoal,
    handleStartRun,

    // 티어 모드 관련 (🔥🔥 반환값 추가)
    isTierPickerOpen,
    tierDistance,
    toggleTierPicker,
    handleSelectTierDistance,
    handleStartTierRun,

    // 공통/지도 관련
    location,
    errorMsg,
    handleOpenFullMap,
  };
};
