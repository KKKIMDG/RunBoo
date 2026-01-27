# 🎯 튜토리얼 기능 구현 완료

RunBoo 앱에 **첫 실행 온보딩**과 **인앱 튜토리얼** 기능이 추가되었습니다!

## ✅ 구현된 기능

### 1. 온보딩 화면 (OnboardingScreen)

- 📱 첫 로그인 시 자동으로 표시되는 슬라이드 온보딩
- 4개 슬라이드: 환영 메시지 → 러닝 기록 → 친구와 함께 → 목표 달성
- "건너뛰기" 및 "시작하기" 버튼 제공
- 슬라이드 페이지네이션 (●○○○)

### 2. 상태 관리 (tutorialStore)

- Zustand + AsyncStorage로 영구 저장
- 저장되는 정보:
  - `hasSeenOnboarding`: 온보딩 화면 봤는지
  - `hasSeenHomeTutorial`: 홈 화면 튜토리얼 봤는지
  - `hasSeenProfileTutorial`: 프로필 화면 튜토리얼 봤는지
  - `hasSeenChallengeTutorial`: 챌린지 화면 튜토리얼 봤는지

### 3. 튜토리얼 재설정 기능

- ⚙️ 설정 화면 → "도움말" 섹션 → "튜토리얼 다시보기"
- AsyncStorage 초기화하여 모든 튜토리얼 리셋

### 4. 앱 통합

- App.tsx에 TutorialProvider 추가
- 로그인 후 온보딩 미완료 시 자동으로 온보딩 화면 표시

## 📂 추가된 파일

```
frontend/src/
├── stores/
│   └── tutorialStore.ts          # 튜토리얼 상태 관리
├── hooks/
│   └── useTutorial.ts             # 튜토리얼 로직 훅
├── components/
│   └── tutorial/
│       └── TutorialProvider.tsx   # Copilot Provider 래퍼
└── screens/
    └── tutorial/
        └── OnboardingScreen.tsx   # 온보딩 슬라이드 화면
```

## 🎨 사용법

### 튜토리얼 테스트하기

```bash
# 방법 1: AsyncStorage 직접 초기화
npx react-native-debugger
# DevTools → Application → Storage → Clear

# 방법 2: 설정에서 재설정
# 앱 실행 → 설정 → 도움말 → 튜토리얼 다시보기
```

### 온보딩 화면 커스터마이징

[src/screens/tutorial/OnboardingScreen.tsx](src/screens/tutorial/OnboardingScreen.tsx) 파일에서:

```typescript
const SLIDES: OnboardingSlide[] = [
  {
    id: "1",
    title: "새로운 타이틀",
    description: "새로운 설명",
    icon: "🎉", // 이모지 변경
  },
  // 슬라이드 추가/삭제 가능
];
```

### 인앱 튜토리얼 추가하는 법 (향후 확장)

1. **CopilotStep으로 UI 요소 래핑:**

```tsx
import { CopilotStep, walkthroughable } from "react-native-copilot";

const WalkthroughableView = walkthroughable(View);

// 튜토리얼을 추가하고 싶은 버튼에:
<CopilotStep
  text="이 버튼을 눌러 러닝을 시작하세요"
  order={1}
  name="startRunButton"
>
  <WalkthroughableView>
    <TouchableOpacity onPress={onStartRun}>
      <Text>러닝 시작</Text>
    </TouchableOpacity>
  </WalkthroughableView>
</CopilotStep>;
```

2. **튜토리얼 시작:**

```tsx
import { useCopilot } from "react-native-copilot";

function HomeScreen() {
  const { start } = useCopilot();
  const { hasSeenHomeTutorial, completeTutorial } = useTutorial();

  useEffect(() => {
    if (!hasSeenHomeTutorial) {
      start();
    }
  }, [hasSeenHomeTutorial]);

  // 튜토리얼 완료 시
  const handleTutorialComplete = () => {
    completeTutorial("home");
  };
}
```

## 🔧 커스터마이징 가이드

### 색상 변경

[src/components/tutorial/TutorialProvider.tsx](src/components/tutorial/TutorialProvider.tsx):

```tsx
tooltipStyle={{
  backgroundColor: "#000",  // 툴팁 배경색
  borderRadius: 12,
}}
arrowColor="#000"          // 화살표 색상
backdropColor="rgba(0, 0, 0, 0.8)"  // 오버레이 색상
```

### 텍스트 변경

```tsx
labels={{
  skip: "건너뛰기",
  next: "다음",
  previous: "이전",
  finish: "완료",
}}
```

## 🚀 동작 원리

1. **첫 실행:**

   - 사용자가 처음 로그인
   - `hasSeenOnboarding === false`
   - App.tsx에서 OnboardingScreen 렌더링

2. **온보딩 완료:**

   - "시작하기" 또는 "건너뛰기" 클릭
   - `markOnboardingComplete()` 호출
   - AsyncStorage에 `hasSeenOnboarding: true` 저장
   - 다음부터는 온보딩 화면 건너뜀

3. **재설정:**
   - 설정 → 튜토리얼 다시보기
   - `resetAllTutorials()` 호출
   - AsyncStorage 초기화
   - 앱 재시작 시 온보딩부터 다시 시작

## 📝 주요 API

### useTutorial Hook

```typescript
const {
  hasSeenOnboarding, // 온보딩 봤는지
  hasSeenHomeTutorial, // 홈 튜토리얼 봤는지
  hasCompletedAllTutorials, // 모든 튜토리얼 완료했는지
  completeOnboarding, // 온보딩 완료 처리
  completeTutorial, // 특정 화면 튜토리얼 완료
  resetAllTutorials, // 모든 튜토리얼 리셋
} = useTutorial();
```

### tutorialStore

```typescript
// 직접 접근 (필요시)
import { useTutorialStore } from "@/stores/tutorialStore";

const store = useTutorialStore();
store.markOnboardingComplete();
store.resetAllTutorials();
```

## 🎯 다음 단계 (선택사항)

현재는 온보딩 화면만 구현되어 있습니다. 향후 추가 가능한 기능:

1. **홈 화면 인앱 튜토리얼**

   - "러닝 시작" 버튼에 하이라이트
   - "측정/티어/고스트" 탭 설명

2. **프로필 화면 튜토리얼**

   - 배지/기록 보는 방법

3. **챌린지 화면 튜토리얼**
   - 친구 초대 방법

## ⚠️ 주의사항

- AsyncStorage에 저장되므로 앱 재설치 시 튜토리얼 다시 표시됨 (정상 동작)
- 서버 연동 없음 (클라이언트 전용)
- 크로스 디바이스 동기화 없음 (다른 기기에서는 다시 표시됨)

## 🐛 문제 해결

### 온보딩이 계속 나타나요

```bash
# AsyncStorage 확인
npx react-native-debugger
# Application → Local Storage → tutorial-storage 확인
```

### 튜토리얼이 안 나타나요

```bash
# 설정에서 리셋
설정 → 도움말 → 튜토리얼 다시보기

# 또는 직접 초기화
AsyncStorage.removeItem('tutorial-storage')
```

## 📦 설치된 패키지

- `react-native-copilot`: 인앱 튜토리얼 라이브러리
- `zustand`: 상태 관리
- `@react-native-async-storage/async-storage`: 로컬 저장소

---

**구현 완료!** 🎉

이제 사용자들이 앱을 처음 켤 때 친절한 가이드를 받을 수 있습니다.
