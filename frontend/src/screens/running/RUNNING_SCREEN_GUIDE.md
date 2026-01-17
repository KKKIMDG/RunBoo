# RunningScreen.tsx 완벽 가이드 📱

> 이 문서는 RunningScreen.tsx 파일의 모든 코드를 초보자도 이해할 수 있도록 상세히 설명합니다.

---

## 📚 목차

1. [Import 문 이해하기](#1-import-문-이해하기)
2. [전역 변수와 초기 설정](#2-전역-변수와-초기-설정)
3. [컴포넌트 구조 이해하기](#3-컴포넌트-구조-이해하기)
4. [상태 관리와 훅](#4-상태-관리와-훅)
5. [지도 기능](#5-지도-기능)
6. [음성 피드백 시스템](#6-음성-피드백-시스템)
7. [UI 렌더링](#7-ui-렌더링)
8. [스타일링](#8-스타일링)

---

## 1. Import 문 이해하기

### 1.1 React 관련 Import

```javascript
import React, { useRef, useEffect, useMemo } from "react";
```

**설명:**

- `React`: React 라이브러리의 핵심. 컴포넌트를 만들 때 필요
- `useRef`: 값을 저장하지만 변경되어도 화면이 다시 그려지지 않는 저장소 (예: 지도 참조)
- `useEffect`: 특정 값이 변경될 때 실행할 코드를 작성하는 훅 (예: 거리가 변경되면 음성 안내)
- `useMemo`: 계산 결과를 저장해두고 필요할 때만 다시 계산하는 훅 (성능 최적화)

### 1.2 React Native 기본 컴포넌트

```javascript
import {
  View, // HTML의 <div>와 같은 컨테이너
  Text, // 텍스트를 표시하는 컴포넌트
  TouchableOpacity, // 터치 가능한 버튼 (터치시 투명도 변경)
  ScrollView, // 스크롤 가능한 영역
  Dimensions, // 화면 크기 정보를 가져오기
  Alert, // 경고창 표시
  StyleSheet, // 스타일을 효율적으로 관리
  ActivityIndicator, // 로딩 스피너
  Platform, // iOS/Android 구분
} from "react-native";
```

### 1.3 서드파티 라이브러리

```javascript
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "react-native-maps";
```

- **MapView**: 지도를 표시하는 컴포넌트
- **PROVIDER_GOOGLE**: Android에서 Google Maps 사용
- **PROVIDER_DEFAULT**: iOS에서 Apple Maps 사용

```javascript
import { LineChart } from "react-native-chart-kit";
```

- **LineChart**: 선 그래프를 그리는 컴포넌트 (페이스 변화 차트)

```javascript
import {
  Ionicons, // iOS 스타일 아이콘
  MaterialCommunityIcons, // Material Design 아이콘
  FontAwesome5, // Font Awesome 아이콘
} from "@expo/vector-icons";
```

- 다양한 아이콘을 사용하기 위한 라이브러리

```javascript
import * as Speech from "expo-speech";
```

- **Speech**: 텍스트를 음성으로 변환해주는 라이브러리

### 1.4 커스텀 파일 Import

```javascript
import "@/services/record/locationTask";
```

- 백그라운드에서 위치를 추적하는 작업 등록

```javascript
import { useRunningScreen } from "./useRunningScreen";
```

- 러닝 화면의 모든 비즈니스 로직을 담은 커스텀 훅

```javascript
import { getStyles } from "./RunningScreen.styles";
```

- 스타일 정의 파일

```javascript
import { StatBox } from "@/components/StatBox";
```

- 통계를 표시하는 재사용 가능한 컴포넌트

---

## 2. 전역 변수와 초기 설정

### 2.1 화면 너비 가져오기

```javascript
const { width } = Dimensions.get("window");
```

**설명:**

- 사용자의 디바이스 화면 너비를 가져옴
- 차트의 너비를 화면에 맞게 조정하기 위해 사용

**예시:**

- iPhone 13: width = 390
- Galaxy S21: width = 360

---

## 3. 컴포넌트 구조 이해하기

### 3.1 함수형 컴포넌트

```javascript
const RunningScreen = () => {
  // 여기에 모든 로직이 들어감
  return (
    // 여기에 UI가 들어감
  );
};
```

**설명:**

- `RunningScreen`은 함수형 컴포넌트
- 화면에 표시할 내용을 반환(return)
- 함수 안에서 상태 관리, 이벤트 처리 등을 수행

---

## 4. 상태 관리와 훅

### 4.1 기본 참조 생성

```javascript
const mapRef = useRef < MapView > null;
```

**설명:**

- `mapRef`는 지도 컴포넌트를 참조하기 위한 변수
- 지도를 제어하기 위해 사용 (예: 특정 위치로 이동)
- `null`로 시작했다가 나중에 지도가 로드되면 지도 객체가 할당됨

**사용 예시:**

```javascript
// 지도를 특정 위치로 이동
mapRef.current?.animateToRegion({
  latitude: 37.5665,
  longitude: 126.978,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
});
```

### 4.2 설정 가져오기

```javascript
const { settings } = useSettings();
const colorScheme = useResolvedTheme(settings?.themeMode);
const isDarkMode = colorScheme === "dark";
```

**설명:**

- `settings`: 사용자 설정 정보 (테마, 폰트 크기 등)
- `colorScheme`: 현재 테마 (dark 또는 light)
- `isDarkMode`: 다크 모드인지 확인하는 불린 값

**왜 필요한가?**

- 사용자가 설정한 테마에 맞춰 색상을 변경하기 위해

### 4.3 스타일 메모이제이션

```javascript
const styles = useMemo(() => {
  return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
}, [colorScheme, settings?.fontSize]);
```

**설명:**

- `useMemo`는 성능 최적화를 위한 훅
- `colorScheme`이나 `fontSize`가 변경될 때만 스타일을 다시 계산
- 불필요한 재계산을 방지

**비유:**

- 같은 재료로 요리할 때 매번 새로 준비하지 않고, 재료가 바뀔 때만 준비

### 4.4 useRunningScreen 훅

```javascript
const { state, actions, utils } = useRunningScreen();
```

**설명:**

- 러닝 화면의 모든 로직을 관리하는 커스텀 훅
- `state`: 현재 상태 (일시정지, 시간, 거리 등)
- `actions`: 동작 (일시정지, 재개, 정지 등)
- `utils`: 유틸리티 함수 (시간 포맷, 페이스 포맷 등)

**state 구조:**

```javascript
const {
  isPaused, // 일시정지 상태인가?
  time, // 경과 시간 (초)
  distance, // 달린 거리 (미터)
  currentPace, // 현재 페이스 (초/km)
  routeCoordinates, // 달린 경로 좌표들
  paceHistory, // 페이스 히스토리 (차트용)
  isReady, // 카운트다운 중인가?
  countdown, // 카운트다운 숫자
  initialLocation, // 시작 위치
  targetDistance, // 목표 거리
  isVoiceEnabled, // 음성 안내 활성화?
  isMale, // 남성 목소리?
} = state;
```

### 4.5 지도 포커싱 훅

```javascript
const mapFocusing = useMapFocusing({
  mapRef,
  initialLocation,
  routeCoordinates,
});

const { isFollowing, onLocationUpdate, handleFocusPress } = mapFocusing;
```

**설명:**

- `isFollowing`: 지도가 사용자를 자동으로 따라가는가?
- `onLocationUpdate`: 새로운 위치 업데이트 함수
- `handleFocusPress`: 위치 버튼을 눌렀을 때 실행되는 함수

### 4.6 위치 업데이트 감지

```javascript
useEffect(() => {
  if (routeCoordinates.length > 0 && onLocationUpdate.current) {
    const lastCoord = routeCoordinates[routeCoordinates.length - 1];
    onLocationUpdate.current(lastCoord);
  }
}, [routeCoordinates]);
```

**설명:**

- `routeCoordinates`가 변경될 때마다 실행
- 가장 최근 좌표를 가져와서 지도를 업데이트
- 사용자가 이동하면 지도도 따라 이동

**단계별 동작:**

1. 새로운 GPS 좌표가 `routeCoordinates`에 추가됨
2. useEffect가 감지
3. 배열의 마지막 좌표를 가져옴
4. `onLocationUpdate`를 호출해서 지도를 해당 위치로 이동

### 4.7 케이던스 측정

```javascript
const cadence = useCadence({
  enabled: !isReady && !isPaused,
  windowSec: 5,
});
```

**설명:**

- **케이던스(Cadence)**: 1분당 걸음 수 (SPM - Steps Per Minute)
- `enabled`: 카운트다운 끝나고 일시정지 아닐 때만 측정
- `windowSec`: 5초 단위로 케이던스 계산

**예시:**

- 5초 동안 40걸음 → 60/5 \* 40 = 480 걸음/분 → 케이던스 = 240 spm (한 발 기준)

### 4.8 케이던스 샘플 저장

```javascript
useEffect(() => {
  if (cadence > 0) {
    console.log("[RunningScreen] 케이던스 샘플 추가:", cadence);
  }
  actions.pushCadenceSample(cadence);
}, [cadence]);
```

**설명:**

- 케이던스 값이 변경될 때마다 실행
- 0보다 크면 콘솔에 로그 출력 (디버깅용)
- `pushCadenceSample`로 샘플을 배열에 추가 (나중에 평균 계산)

---

## 5. 지도 기능

### 5.1 지도 렌더링 최적화

```javascript
const renderedMap = useMemo(
  () => (
    <View style={StyleSheet.absoluteFill}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={
          Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
        }
        showsUserLocation={true}
        loadingEnabled={true}
        customMapStyle={colorScheme === "dark" ? darkMapStyle : lightMapStyle}
        showsMyLocationButton={false}
        onPanDrag={() => {
          if (isFollowing) {
            console.log("[RunningScreen] 지도 드래그됨, 자동 추적 비활성화");
            mapFocusing.setIsFollowing(false);
          }
        }}
        initialRegion={
          initialLocation
            ? {
                ...initialLocation,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
              }
            : {
                latitude: 37.5665,
                longitude: 126.978,
                latitudeDelta: 0.002,
                longitudeDelta: 0.002,
              }
        }
      />
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDarkMode
              ? "rgba(0,0,0,0.15)"
              : "rgba(255,255,255,0.1)",
          },
        ]}
        pointerEvents="none"
      />
    </View>
  ),
  [initialLocation, isDarkMode, isFollowing],
);
```

**주요 속성 설명:**

#### `ref={mapRef}`

- 지도를 제어하기 위한 참조 연결

#### `provider`

```javascript
Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT;
```

- Android: Google Maps 사용
- iOS: Apple Maps 사용

#### `showsUserLocation={true}`

- 사용자의 현재 위치를 파란 점으로 표시

#### `customMapStyle`

- 다크 모드/라이트 모드에 따라 지도 스타일 변경

#### `onPanDrag`

```javascript
onPanDrag={() => {
  if (isFollowing) {
    mapFocusing.setIsFollowing(false);
  }
}}
```

- 사용자가 지도를 손가락으로 드래그하면
- 자동 추적을 비활성화 (사용자가 직접 보고 싶은 곳을 보려는 의도)

#### `initialRegion`

```javascript
{
  latitude: 37.5665,      // 위도
  longitude: 126.978,     // 경도
  latitudeDelta: 0.002,   // 세로 확대 정도 (작을수록 확대)
  longitudeDelta: 0.002,  // 가로 확대 정도
}
```

- 지도의 초기 위치와 확대 수준 설정
- 기본값은 서울 시청 근처

#### 오버레이 View

```javascript
<View
  style={{
    backgroundColor: isDarkMode
      ? "rgba(0,0,0,0.15)" // 다크모드: 약간 어둡게
      : "rgba(255,255,255,0.1)", // 라이트모드: 약간 밝게
  }}
  pointerEvents="none" // 터치 이벤트 무시
/>
```

- 지도 위에 반투명 레이어를 추가해서 시각적 효과 개선

---

## 6. 음성 피드백 시스템

### 6.1 음성 피드백 훅

```javascript
const { checkAndSpeak, speakStart, speakPause, speakResume, speakStop } =
  useRunningVoiceFeedback({
    isMale: isMale,
    targetDistance: targetDistance,
  });
```

**함수 설명:**

- `checkAndSpeak`: 일정 거리마다 음성 안내 (예: 1km마다)
- `speakStart`: "러닝을 시작합니다"
- `speakPause`: "일시정지"
- `speakResume`: "재개합니다"
- `speakStop`: "총 거리 X km, 수고하셨습니다"

### 6.2 음성 토글 함수

```javascript
const toggleVoice = () => {
  console.log("[RunningScreen] 음성 토글:", !isVoiceEnabled);
  if (isVoiceEnabled) Speech.stop();
  setIsVoiceEnabled(!isVoiceEnabled);
};
```

**동작:**

1. 현재 상태를 반대로 전환
2. 음성이 켜져있었으면 현재 재생 중인 음성 중지
3. 상태 업데이트

### 6.3 컴포넌트 언마운트 시 음성 정리

```javascript
useEffect(() => {
  return () => {
    Speech.stop();
  };
}, []);
```

**설명:**

- 화면을 벗어날 때 (컴포넌트가 사라질 때) 실행
- 재생 중인 음성을 중지
- 메모리 누수 방지

### 6.4 시작 음성 안내

```javascript
const prevIsReady = useRef(isReady);
useEffect(() => {
  if (isVoiceEnabled && prevIsReady.current === true && isReady === false) {
    console.log("[RunningScreen] 시작 안내 음성 재생");
    speakStart();
  }
  prevIsReady.current = isReady;
}, [isReady, isVoiceEnabled]);
```

**단계별 설명:**

1. `prevIsReady`에 이전 상태 저장
2. `isReady`가 `true`에서 `false`로 변경되면 (카운트다운 종료)
3. 음성이 활성화되어 있으면
4. "러닝을 시작합니다" 음성 재생
5. 현재 상태를 `prevIsReady`에 저장

**왜 이렇게?**

- `isReady`의 변화를 감지하기 위해 이전 값을 저장
- 카운트다운이 끝나는 순간을 정확히 포착

### 6.5 거리별 음성 안내

```javascript
useEffect(() => {
  if (isVoiceEnabled && !isPaused && !isReady && distance > 0) {
    console.log("[RunningScreen] 음성 안내 확인 - 거리:", distance);
    checkAndSpeak(distance);
  }
}, [distance, isPaused, isReady, isVoiceEnabled, isMale]);
```

**조건:**

- 음성이 활성화되어 있고
- 일시정지 상태가 아니고
- 카운트다운이 끝났고
- 거리가 0보다 크면
- 거리를 확인해서 필요하면 음성 안내

**예시:**

- 1km 달림 → "1킬로미터 달렸습니다"
- 2km 달림 → "2킬로미터 달렸습니다"

### 6.6 일시정지/재개 음성 안내

```javascript
const prevIsPaused = useRef(isPaused);
useEffect(() => {
  if (isVoiceEnabled && !isReady && prevIsPaused.current !== isPaused) {
    if (isPaused) {
      console.log("[RunningScreen] 일시정지 안내 음성 재생");
      speakPause();
    } else {
      console.log("[RunningScreen] 재개 안내 음성 재생");
      speakResume();
    }
  }
  prevIsPaused.current = isPaused;
}, [isPaused, isReady, isVoiceEnabled]);
```

**동작:**

- `isPaused` 상태가 변경될 때마다 실행
- 일시정지 → "일시정지"
- 재개 → "재개합니다"

---

## 7. UI 렌더링

### 7.1 차트 데이터

```javascript
const chartData = useMemo(
  () => ({
    labels: [],
    datasets: [
      {
        data: paceHistory.length > 0 ? paceHistory : [0],
        color: (opacity = 1) => `rgba(74, 110, 169, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  }),
  [paceHistory],
);
```

**설명:**

- `labels`: X축 라벨 (비어있음)
- `data`: Y축 데이터 (페이스 히스토리)
- `color`: 선 색상 (파란색)
- `strokeWidth`: 선 두께

**paceHistory 예시:**

```javascript
[300, 310, 295, 305, 290]; // 초/km
```

### 7.2 차트 설정

```javascript
const chartConfig = useMemo(() => {
  const bgColor = isDarkMode ? "#121212" : "#FFFFFF";
  return {
    backgroundGradientFrom: bgColor,
    backgroundGradientTo: bgColor,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(74,110,169,${opacity})`,
    labelColor: () => (isDarkMode ? "#FFF" : "#333"),
    propsForDots: { r: "0" }, // 점 숨기기
    propsForBackgroundLines: {
      strokeWidth: 0, // 격자선 숨기기
    },
  };
}, [isDarkMode]);
```

### 7.3 정지 버튼 핸들러

```javascript
const handleStopLongPress = () => {
  console.log("[RunningScreen] 정지 버튼 길게 누름");
  if (isVoiceEnabled) {
    console.log("[RunningScreen] 정지 안내 음성 재생");
    speakStop(distance);
    stopRun();
  } else {
    stopRun();
  }
};
```

**동작:**

1. 정지 버튼을 0.5초 이상 누르면 실행
2. 음성이 활성화되어 있으면 종료 음성 재생
3. `stopRun()` 호출 → 러닝 종료 및 결과 저장

### 7.4 메인 렌더링 구조

```javascript
return (
  <SafeAreaView style={styles.container}>
    {/* 카운트다운 오버레이 */}
    {isReady && (
      <View style={styles.countdownOverlay}>
        <Text style={styles.countdownText}>
          {countdown > 0 ? countdown : "GO!"}
        </Text>
        <Text style={styles.countdownLabel}>준비하세요!</Text>
      </View>
    )}

    <ScrollView>
      {/* 헤더 */}
      {/* 통계 영역 */}
      {/* 차트 */}
      {/* 지도 */}
    </ScrollView>

    {/* 컨트롤 버튼 */}
    {!isReady && (
      <View style={styles.controlContainer}>
        {/* 일시정지/재개 버튼 */}
        {/* 정지 버튼 */}
      </View>
    )}
  </SafeAreaView>
);
```

**SafeAreaView:**

- 아이폰의 노치(상단 카메라 부분)나 홈 인디케이터를 피해서 렌더링

**조건부 렌더링:**

- `{isReady && ...}`: 카운트다운 중일 때만 표시
- `{!isReady && ...}`: 러닝 중일 때만 표시

### 7.5 헤더 영역

```javascript
<View style={styles.header}>
  {/* 상태 태그 */}
  <View style={styles.statusTag}>
    <View
      style={[
        styles.statusDot,
        { backgroundColor: isPaused ? "#FFB347" : "#4CAF50" },
      ]}
    />
    <Text style={styles.statusText}>{isPaused ? "일시정지" : "러닝 중"}</Text>
  </View>

  {/* 버튼 그룹 */}
  <View style={{ flexDirection: "row", gap: 8 }}>
    {/* 성별 토글 버튼 */}
    <TouchableOpacity
      onPress={() => {
        setIsMale(!isMale);
      }}
      style={customStyles.genderToggle}
    >
      <Text>{isMale ? "남성" : "여성"}</Text>
    </TouchableOpacity>

    {/* 음성 토글 버튼 */}
    <TouchableOpacity
      onPress={toggleVoice}
      style={[
        customStyles.genderToggle,
        { backgroundColor: isVoiceEnabled ? "#4A6EA9" : "#E0E0E0" },
      ]}
    >
      <Ionicons
        name={isVoiceEnabled ? "volume-high" : "volume-mute"}
        size={14}
        color={isVoiceEnabled ? "#FFF" : "#666"}
      />
      <Text>{isVoiceEnabled ? "음성 ON" : "음성 OFF"}</Text>
    </TouchableOpacity>
  </View>
</View>
```

**statusDot 색상:**

- 일시정지: 주황색 (#FFB347)
- 러닝 중: 초록색 (#4CAF50)

### 7.6 통계 영역

```javascript
<View style={styles.statsContainer}>
  <StatBox
    icon={<Ionicons name="time-outline" size={20} color="#8E8E93" />}
    label="시간"
    value={formatTime(time)}
  />
  <StatBox
    icon={
      <MaterialCommunityIcons
        name="map-marker-distance"
        size={20}
        color="#2D3269"
      />
    }
    label="거리"
    value={(distance / 1000).toFixed(2)}
    unit="km"
    highlight
  />
  <StatBox
    icon={<FontAwesome5 name="running" size={18} color="#1A1A1A" />}
    label="페이스"
    value={formatPace(currentPace)}
  />
  <StatBox
    icon={
      <MaterialCommunityIcons name="shoe-print" size={20} color="#8E8E93" />
    }
    label="케이던스"
    value={String(cadence)}
    unit="spm"
  />
</View>
```

**각 StatBox 설명:**

1. **시간**
   - 아이콘: 시계
   - 값: `formatTime(time)` → "00:15:32" 형식

2. **거리** (강조)
   - 아이콘: 거리 마커
   - 값: 미터를 km로 변환 후 소수점 2자리
   - 예: 1234m → "1.23 km"
   - `highlight`: 강조 스타일 적용

3. **페이스**
   - 아이콘: 러닝
   - 값: `formatPace(currentPace)` → "5'20\"" 형식 (분'초")

4. **케이던스**
   - 아이콘: 발자국
   - 값: 현재 측정된 케이던스
   - 단위: spm (steps per minute)

### 7.7 페이스 변화 차트

```javascript
<View style={styles.chartCard}>
  <View style={styles.chartTitleContainer}>
    <Ionicons name="analytics-outline" size={15} color={...} />
    <Text style={styles.chartTitle}>페이스 변화</Text>
  </View>

  <LineChart
    data={chartData}
    width={width - 88}  // 화면 너비 - 여백
    height={150}
    chartConfig={chartConfig}
    bezier  // 부드러운 곡선
    style={styles.chart}
    withInnerLines={true}
    withOuterLines={true}
    withVerticalLabels={false}  // 세로 라벨 숨김
    withHorizontalLabels={false}  // 가로 라벨 숨김
  />

  <View style={styles.chartLabels}>
    <Text style={styles.chartLabelText}>시작</Text>
    <Text style={styles.chartLabelText}>
      현재 페이스: {formatPace(currentPace)}/km
    </Text>
  </View>
</View>
```

**차트 특징:**

- `bezier`: 점들을 부드러운 곡선으로 연결
- 라벨 숨김: 깔끔한 디자인
- 커스텀 라벨: 하단에 "시작"과 "현재 페이스" 표시

### 7.8 지도 컨테이너

```javascript
<View style={styles.mapContainer}>
  {!initialLocation ? (
    // 로딩 중
    <View style={...}>
      <ActivityIndicator size="large" color="#4A6EA9" />
    </View>
  ) : (
    // 지도 표시
    renderedMap
  )}

  {/* 위치 포커싱 버튼 */}
  <TouchableOpacity
    style={[
      customStyles.locationButton,
      {
        backgroundColor: isFollowing
          ? "#4A6EA9"  // 추적 중: 파란색
          : isDarkMode
          ? "#333"     // 추적 안함 + 다크모드: 어두운 회색
          : "#FFF"     // 추적 안함 + 라이트모드: 흰색
      },
    ]}
    onPress={handleFocusPress}
  >
    <MaterialCommunityIcons
      name="crosshairs-gps"
      size={24}
      color={isFollowing ? "#FFF" : isDarkMode ? "#AAA" : "#333"}
    />
  </TouchableOpacity>
</View>
```

**위치 버튼 동작:**

1. 버튼 클릭
2. `handleFocusPress` 호출
3. `isFollowing`을 `true`로 설정
4. 지도가 사용자 위치를 자동으로 따라감
5. 사용자가 지도를 드래그하면 `isFollowing`이 `false`로 변경

### 7.9 컨트롤 버튼

```javascript
{
  !isReady && (
    <View style={styles.controlContainer}>
      {/* 일시정지/재개 버튼 */}
      <TouchableOpacity
        style={styles.pauseButton}
        onPress={() => {
          if (isPaused) {
            console.log("[RunningScreen] 재개 버튼 누름");
            resumeRun();
          } else {
            console.log("[RunningScreen] 일시정지 버튼 누름");
            pauseRun();
          }
        }}
      >
        <Ionicons
          name={isPaused ? "play" : "pause"}
          size={36}
          color="#4A6EA9"
        />
      </TouchableOpacity>

      {/* 정지 버튼 */}
      <TouchableOpacity
        style={[styles.stopButton, { backgroundColor: "#FF3B30" }]}
        onPress={() => Alert.alert("알림", "종료하려면 길게 누르세요.")}
        onLongPress={handleStopLongPress}
        delayLongPress={500} // 0.5초
      >
        <View style={customStyles.stopSquare} />
      </TouchableOpacity>
    </View>
  );
}
```

**버튼 동작:**

1. **일시정지/재개 버튼**
   - 일시정지 상태면 → play 아이콘, 클릭시 `resumeRun()`
   - 러닝 중이면 → pause 아이콘, 클릭시 `pauseRun()`

2. **정지 버튼**
   - 짧게 클릭: 경고창 표시
   - 0.5초 이상 길게 클릭: 러닝 종료 (`handleStopLongPress`)
   - 빨간색 버튼 안에 흰색 사각형 아이콘

---

## 8. 스타일링

### 8.1 커스텀 스타일

```javascript
const customStyles = StyleSheet.create({
  locationButton: {
    position: "absolute",
    right: 15,
    bottom: 15,
    width: 45,
    height: 45,
    borderRadius: 22.5, // 원형 (45 / 2)
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // Android 그림자
    zIndex: 10,
  },
  stopSquare: {
    width: 24,
    height: 24,
    backgroundColor: "white",
    borderRadius: 4, // 약간 둥근 사각형
  },
  genderToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#4A6EA9",
  },
});
```

**스타일 설명:**

- **locationButton**: 지도 위의 GPS 버튼
  - `position: "absolute"`: 절대 위치 (다른 요소와 겹칠 수 있음)
  - `right: 15, bottom: 15`: 오른쪽 하단에 배치
  - `borderRadius: 22.5`: 정사각형을 원으로 만듦
  - `elevation: 5`: Android에서 그림자 효과
  - `zIndex: 10`: 다른 요소 위에 표시

- **stopSquare**: 정지 버튼의 사각형 아이콘
  - 흰색 배경에 약간 둥근 모서리

- **genderToggle**: 성별/음성 토글 버튼
  - `flexDirection: "row"`: 아이콘과 텍스트를 가로로 배치

---

## 9. 전체 흐름 정리

### 9.1 러닝 시작 흐름

```
1. 화면 진입
   ↓
2. GPS 위치 수신 (initialLocation 설정)
   ↓
3. 카운트다운 시작 (3, 2, 1, GO!)
   ↓
4. isReady가 false로 변경
   ↓
5. 시작 음성 재생 (음성 활성화 시)
   ↓
6. 타이머 시작, GPS 추적 시작
   ↓
7. 케이던스 측정 시작
   ↓
8. 페이스 계산 시작
```

### 9.2 러닝 중 흐름

```
위치 업데이트
   ↓
routeCoordinates 배열에 추가
   ↓
지도 자동 추적 (isFollowing = true)
   ↓
거리 계산
   ↓
페이스 계산
   ↓
paceHistory에 추가
   ↓
차트 업데이트
   ↓
일정 거리마다 음성 안내
```

### 9.3 일시정지 흐름

```
일시정지 버튼 클릭
   ↓
pauseRun() 호출
   ↓
isPaused = true
   ↓
타이머 정지
   ↓
GPS 추적 정지
   ↓
케이던스 측정 정지
   ↓
일시정지 음성 재생 (음성 활성화 시)
```

### 9.4 종료 흐름

```
정지 버튼 0.5초 이상 누름
   ↓
handleStopLongPress() 호출
   ↓
종료 음성 재생 (음성 활성화 시)
   ↓
stopRun() 호출
   ↓
러닝 데이터 계산 (평균 페이스, 평균 케이던스 등)
   ↓
데이터베이스에 저장
   ↓
결과 화면으로 이동
```

---

## 10. 주요 개념 정리

### 10.1 React Hooks

| Hook          | 용도           | 예시                                    |
| ------------- | -------------- | --------------------------------------- |
| `useState`    | 상태 관리      | `const [count, setCount] = useState(0)` |
| `useEffect`   | 사이드 이펙트  | 데이터 가져오기, 구독 설정              |
| `useRef`      | 참조 저장      | DOM 요소, 이전 값 저장                  |
| `useMemo`     | 계산 결과 캐싱 | 복잡한 계산, 객체 생성                  |
| `useCallback` | 함수 캐싱      | 자식 컴포넌트에 전달하는 함수           |

### 10.2 React Native 컴포넌트

| 컴포넌트           | 설명             | HTML 비교                        |
| ------------------ | ---------------- | -------------------------------- |
| `View`             | 컨테이너         | `<div>`                          |
| `Text`             | 텍스트           | `<p>`, `<span>`                  |
| `TouchableOpacity` | 터치 가능한 요소 | `<button>`                       |
| `ScrollView`       | 스크롤 영역      | `<div style="overflow: scroll">` |
| `SafeAreaView`     | 안전 영역        | -                                |

### 10.3 성능 최적화

1. **useMemo**: 차트 데이터, 스타일 등 무거운 계산 캐싱
2. **렌더링 최적화**: 지도를 useMemo로 감싸서 불필요한 재렌더링 방지
3. **조건부 렌더링**: 필요할 때만 컴포넌트 표시

### 10.4 디버깅 팁

```javascript
console.log("[RunningScreen] 케이던스 샘플 추가:", cadence);
```

- `[RunningScreen]` 접두사로 어느 파일의 로그인지 구분
- 중요한 값 변경 시점에 로그 추가
- 사용자 액션 시 로그로 추적

---

## 11. 자주 묻는 질문

### Q1: useEffect는 언제 실행되나요?

**A:** 의존성 배열에 있는 값이 변경될 때 실행됩니다.

```javascript
useEffect(() => {
  console.log("distance 변경됨:", distance);
}, [distance]); // distance가 변경될 때마다 실행
```

### Q2: useMemo는 왜 사용하나요?

**A:** 성능 최적화를 위해 사용합니다. 같은 계산을 반복하지 않도록 결과를 캐싱합니다.

```javascript
// useMemo 없이
const chartData = {
  labels: [],
  datasets: [...],  // 매번 새로 생성
};

// useMemo 사용
const chartData = useMemo(() => ({
  labels: [],
  datasets: [...],  // paceHistory가 변경될 때만 새로 생성
}), [paceHistory]);
```

### Q3: useRef는 언제 사용하나요?

**A:**

1. DOM 요소 참조 (mapRef)
2. 이전 값 저장 (prevIsReady, prevIsPaused)
3. 재렌더링 없이 값 저장

```javascript
const mapRef = useRef(null);
// mapRef.current로 지도를 제어할 수 있음
```

### Q4: ? 연산자는 무엇인가요?

**A:** Optional chaining으로, 값이 없을 때 에러를 방지합니다.

```javascript
settings?.fontSize; // settings가 null/undefined면 undefined 반환
// 같은 의미: settings && settings.fontSize
```

### Q5: ?? 연산자는 무엇인가요?

**A:** Nullish coalescing으로, null이나 undefined일 때 기본값을 사용합니다.

```javascript
settings?.fontSize || "MEDIUM"; // 잘못된 방법 (0, false도 "MEDIUM"으로)
settings?.fontSize ?? "MEDIUM"; // 올바른 방법 (null, undefined만 "MEDIUM"으로)
```

---

## 12. 코드 개선 아이디어

### 12.1 분리 가능한 컴포넌트

현재 하나의 큰 컴포넌트를 다음과 같이 분리할 수 있습니다:

1. **RunningHeader**: 상태 태그, 성별/음성 토글
2. **RunningStats**: 시간, 거리, 페이스, 케이던스
3. **PaceChart**: 페이스 변화 차트
4. **RunningMap**: 지도와 위치 버튼
5. **RunningControls**: 일시정지, 정지 버튼

### 12.2 타입 안전성

TypeScript를 더 활용하여:

```typescript
interface RunningState {
  isPaused: boolean;
  time: number;
  distance: number;
  currentPace: number;
  // ...
}
```

### 12.3 테스트

단위 테스트 추가:

```javascript
describe("formatTime", () => {
  it("should format seconds to MM:SS", () => {
    expect(formatTime(125)).toBe("02:05");
  });
});
```

---

## 13. 참고 자료

- [React Native 공식 문서](https://reactnative.dev/)
- [React Hooks 가이드](https://react.dev/reference/react)
- [Expo Speech API](https://docs.expo.dev/versions/latest/sdk/speech/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)

---

**작성일**: 2026년 1월 17일  
**버전**: 1.0  
**작성자**: GitHub Copilot
