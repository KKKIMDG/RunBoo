# RunBoo 모바일 앱

이 프로젝트는 React Native와 Expo를 사용하여 개발된 모바일 애플리케이션입니다. 사용자에게 다양한 기능을 제공하며, 효율적인 개발을 위해 명확한 폴더 구조와 역할 분담을 따르고 있습니다.

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

-   `src/`: 애플리케이션의 모든 소스 코드가 위치합니다.
    -   `assets/`: 이미지, 폰트 등 정적 파일을 저장합니다. (예: `adaptive-icon.png`, `google.png`)
    -   `components/`: 여러 화면에서 재사용되는 작은 UI 컴포넌트들을 모아둡니다.
        -   `Button/`: 재사용 가능한 버튼 컴포넌트 (예: `PrimaryButton.tsx`)
        -   `form/`: 폼 관련 컴포넌트 (예: `FormField.tsx`)
        -   `layout/`: 화면 레이아웃 관련 컴포넌트 (예: `BottomNavBar.tsx`, `ScreenLayout.tsx`)
        -   `ui/`: 기타 UI 컴포넌트 (예: `ActionButton.tsx`)
        -   직접적인 컴포넌트 파일 (예: `CourseCard.tsx`, `FilterChip.tsx`)
    -   `constants/`: 테마 색상, API 주소 등 앱 전체에서 사용되는 상수 값을 정의합니다. (예: `env.ts`, `theme.ts`)
    -   `hooks/`: 여러 컴포넌트에서 공통으로 사용될 수 있는 로직을 담은 커스텀 React 훅을 작성합니다. (예: `use-color-scheme.ts`, `use-theme-color.ts`)
    -   `navigation/`: 화면 간의 이동 로직을 관리합니다. 네비게이션 스택을 이곳에서 정의합니다. (예: `MainStack.tsx`, `AuthStack.tsx`, `RootNavigator.tsx`)
    -   `screens/`: 앱의 각 화면을 구성하는 메인 컴포넌트 폴더입니다. 각 화면은 하위 폴더로 구성됩니다.
        -   `Course/`: 코스 관련 화면 (예: `CourseScreen.tsx`, `CourseDetailScreen.tsx`)
        -   `Home/`: 홈 화면 (예: `HomeScreen.tsx`)
        -   `Login/`: 로그인 화면 (예: `LoginScreen.tsx`, `LoginContainer.tsx`)
        -   `records/`: 기록 관련 화면 (예: `RecordsScreen.tsx`)
        -   `signup/`: 회원가입 화면 (예: `SignupScreen.tsx`)
        -   `stats/`: 통계 화면 (예: `StatsScreen.tsx`)
        -   `TierResult/`: 티어 결과 화면 (예: `TierResultScreen.tsx`)
    -   `services/`: 외부 API 연동, 인증 처리 등 앱의 핵심 비즈니스 로직을 담당하는 코드를 작성합니다.
        -   `auth/`: 인증 관련 서비스 (예: `authService.ts`)
        -   `record/`: 기록 관련 서비스 (예: `recordsService.ts`)
        -   직접적인 서비스 파일 (예: `api.ts`, `CourseService.ts`, `tierService.ts`)
    -   `types/`: TypeScript에서 사용되는 타입 정의(interface, type)를 모아둡니다. (예: `record.ts`, `tier.ts`, `user.ts`)
    -   `utils/`: 날짜 포맷팅, 데이터 변환 등 특정 도메인에 종속되지 않는 유틸리티 함수를 작성합니다.
    -   `App.tsx`: 애플리케이션의 진입점 역할을 하는 메인 컴포넌트입니다.
    -   `index.ts`: 애플리케이션의 시작점입니다.

## 기타 파일

-   `app.json`: Expo 프로젝트 설정 파일입니다. 앱의 이름, 아이콘, 스플래시 화면 등 전반적인 설정을 정의합니다.
-   `babel.config.js`: Babel 설정 파일입니다. JavaScript/TypeScript 코드를 하위 호환 가능한 버전으로 변환하는 규칙을 정의합니다.
-   `env.d.ts`: TypeScript 환경 변수 정의 파일입니다.
-   `package.json`: 프로젝트의 메타데이터와 종속성(dependencies), 개발 종속성(devDependencies), 스크립트 등을 정의합니다.
-   `package-lock.json`: `package.json`에 명시된 종속성들의 정확한 버전을 기록하여 일관된 설치를 보장합니다.
-   `tsconfig.json`: TypeScript 컴파일러 설정 파일입니다.
-   `.gitignore`: Git 버전 관리에서 제외할 파일 및 폴더를 지정합니다.
-   `.expo/`: Expo 관련 캐시 및 설정 파일이 저장되는 디렉토리입니다.
-   `node_modules/`: `npm install` 명령어를 통해 설치된 모든 패키지들이 저장되는 디렉토리입니다.
-   `.idea/`: WebStorm 또는 IntelliJ IDEA와 같은 IDE의 프로젝트 설정 파일이 저장되는 디렉토리입니다.