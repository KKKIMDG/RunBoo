# RunBoo 모바일 앱

이 프로젝트는 React Native와 Expo를 사용하여 개발된 모바일 애플리케이션입니다. 사용자에게 다양한 기능을 제공하며, 효율적인 개발을 위해 명확한 폴더 구조와 역할 분담을 따르고 있습니다.

## 실행 전 확인

이 앱은 네이티브 Firebase Messaging·카카오·Unistyles 등을 사용합니다. Expo Go나 웹 실행만으로 모바일 기능 전체를 체험할 수 없습니다. 아래는 Android 네이티브 빌드 기준입니다.

1. [루트 README](../README.md)의 안내에 따라 백엔드를 준비합니다.
2. Node.js 22 LTS, JDK 21, Android Studio의 Android SDK와 에뮬레이터를 준비합니다.
3. `frontend/`에서 환경변수 예시를 복사합니다.

```bash
cd frontend
cp .env.example .env
npm ci
```

`.env`의 예시 값을 개발용 설정으로 바꿉니다.

- `API_BASE_URL`: Android 에뮬레이터에서 PC의 서버에 연결할 때 `http://10.0.2.2:8080`. 실기기에서는 같은 네트워크의 PC IP를 사용합니다. `localhost`는 휴대폰 자신을 가리킵니다.
- `FRONT_URL`: `runboo://`
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`: 개발용 Supabase 프로젝트의 공개 클라이언트 설정
- `KAKAO_*`, `GOOGLE_WEB_CLIENT_ID`, `GOOGLE_MAPS_API_KEY`: 사용할 소셜 로그인·지도 설정

개발용 Firebase 프로젝트에 Android 앱 `com.runboo.frontend`를 등록하고, 받은 앱 설정 파일을 `frontend/frontSecrets/google-services.json`에 둡니다. 서버 서비스 계정 JSON과 다른 파일입니다. iOS는 `frontSecrets/GoogleService-Info.plist`가 필요합니다.

Android 에뮬레이터를 먼저 켜거나 USB 디버깅이 가능한 기기를 연결한 뒤:

```bash
npm run android
```

기존에 개발 빌드를 설치했다면 다음부터 `npm start`로 개발 서버를 실행할 수 있습니다. 환경변수를 수정한 뒤에는 `npx expo start --clear`로 다시 시작하고, 네이티브 설정을 바꾸면 다시 빌드합니다.

iOS 개발 빌드는 macOS·Xcode·CocoaPods와 Firebase/APNs 서명 설정을 준비한 뒤 `npm run ios`를 사용합니다. 설치 가능한 배포용 앱을 만드는 절차와는 다릅니다.

실행 후 **회원가입 → 이메일 인증 → 로그인 → 챌린지·기록 화면** 순서로 확인합니다. 위치 기반 기능은 위치 권한과 실제 기기에서 별도로 확인합니다. 앱을 빌드하는 것만으로 외부 서비스나 서버가 준비되지는 않습니다.

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