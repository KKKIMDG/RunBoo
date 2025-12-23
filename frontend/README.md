# RunBoo 모바일 앱

이 프로젝트는 React Native와 Expo를 사용하여 개발되었습니다.

## 시작하기

### 1. 종속성 설치

프로젝트를 시작하기 전에, 다음 명령어를 사용하여 필요한 종속성을 설치하세요.

```bash
npm install
```

### 2. 앱 실행

다음은 각 플랫폼별로 앱을 실행하는 방법입니다.

#### iOS

iOS 시뮬레이터에서 앱을 실행하려면 다음 명령어를 사용하세요.

```bash
npx expo start --ios
```

#### Android

Android 에뮬레이터 또는 연결된 기기에서 앱을 실행하려면 다음 명령어를 사용하세요.

```bash
npx expo start --android
```

#### Web

웹 브라우저에서 앱을 실행하려면 다음 명령어를 사용하세요.

```bash
npx expo start --web
```

## 프로젝트 구조 및 가이드라인

이 프로젝트는 기능별로 코드를 분리하는 구조를 따릅니다. 새로운 코드를 작성할 때 다음 가이드라인을 참고해 주세요.

-   `src/assets`: 이미지, 폰트 등 정적 파일을 저장합니다.
-   `src/components`: 여러 화면에서 재사용되는 작은 UI 컴포넌트 (예: 커스텀 버튼, 아이콘)를 작성합니다.
-   `src/constants`: 테마 색상, API 주소 등 앱 전체에서 사용되는 상수 값을 정의합니다.
-   `src/hooks`: 여러 컴포넌트에서 공통으로 사용될 수 있는 로직을 담은 커스텀 React 훅 (예: `useAuth`, `useAPI`)을 작성합니다.
-   `src/navigation`: 화면 간의 이동 로직을 관리합니다. `expo-router` 설정이나 네비게이션 스택을 이곳에서 정의합니다.
-   `src/screens`: 앱의 각 화면을 구성하는 메인 컴포넌트 폴더입니다. 각 화면은 하위 폴더로 구성됩니다 (예: `src/screens/Home`, `src/screens/Profile`).
-   `src/services`: 외부 API 연동, 인증 처리 등 앱의 핵심 비즈니스 로직을 담당하는 코드를 작성합니다.
-   `src/types`: TypeScript에서 사용되는 타입 정의(interface, type)를 모아둡니다.
-   `src/utils`: 날짜 포맷팅, 데이터 변환 등 특정 도메인에 종속되지 않는 유틸리티 함수를 작성합니다.
