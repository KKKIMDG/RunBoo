import { Platform } from "react-native";

// ========================================================================
//  1. 색상 (Colors)
// ========================================================================
// 앱의 핵심 색상들을 라이트/다크 모드에 맞춰 정의합니다.
// 시맨틱 이름(의미론적 이름)을 사용하여 색상의 역할을 명확히 합니다.
// 예: 'primary'는 주요 버튼/아이콘, 'background'는 화면 배경.
// ========================================================================

const tintColorLight = "#3A4A98"; // 기존 primary 색상을 tint로 활용
const tintColorDark = "#FFFFFF";

export const Colors = {
  light: {
    text: "#11181C", // 기본 텍스트
    subtext: "#687076", // 보조 텍스트 (회색)
    background: "#FFFFFF", // 기본 화면 배경
    secondaryBackground: "#F1F3F5", // 보조 배경 (카드, 입력창 등)
    tint: tintColorLight, // 틴트 컬러 (주로 액티브 아이콘, 로딩 인디케이터 등에 사용)
    icon: "#687076", // 기본 아이콘
    tabIconDefault: "#868E96", // 탭바 비활성 아이콘
    tabIconSelected: tintColorLight, // 탭바 활성 아이콘
    card: "#FFFFFF", // 카드 배경
    primary: "#3A4A98", // 주요 브랜드 색상 (버튼, 강조)
    primaryButtonText: "#FFFFFF", // 프라이머리 버튼 텍스트
    secondary: "#2741a8", // 보조 브랜드 색상
    disabled: "#ADB5BD", // 비활성화 상태 (버튼, 입력창)
    border: "#E9ECEF", // 경계선
    error: "#FF6467", // 에러 (빨강)
    success: "#4CAF50", // 성공 (초록)
    warning: "#FFC107", // 경고 (노랑)
    heart: "#FF6B6B", // 하트, 찜하기
    kakao: "#FEE500", // 카카오 로그인 버튼
    black: "#000000",
    white: "#FFFFFF",
    shadow: "#000000",
    activeIcon: "#3A4A98",
    inactiveIcon: "#ffffffff",
    borders: "#E9ECEF",
    muted: "#ADB5BD",
    warningBox: "#EEF2FF",
    warningTitle: "#3A4A98",
    warningText: "#4B5563",
    destructiveBox: "#FEF2F2", // 매우 연한 레드 배경
    destructiveTitle: "#DC2626", // 또렷한 레드 타이틀
    destructiveText: "#7F1D1D",
    infoText: "#687076",
    disabledText: "#4f4f4f",
  },
  dark: {
    text: "#ECEDEE",
    subtext: "#60686eff",
    background: "#121212",
    secondaryBackground: "#2C2C2E",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#868E96",
    tabIconSelected: tintColorDark,
    card: "#1E1E1E",
    primary: "#5E6DAF",
    primaryButtonText: "#FFFFFF",
    secondary: "#7890FF",
    disabled: "#48484A",
    border: "#38383A",
    error: "#FF6B6B",
    success: "#66BB6A",
    warning: "#FFCA28",
    heart: "#FF6B6B",
    kakao: "#FEE500",
    black: "#000000",
    white: "#FFFFFF",
    shadow: "#FFFFFF",
    activeIcon: "#FFFFFF",
    inactiveIcon: "#868E96",
    borders: "#38383A",
    muted: "#48484A",
    warningBox: "#1F2A44",
    warningTitle: "#A5B4FC",
    warningText: "#CBD5E1",
    destructiveBox: "#2A1215", // 다크 레드 배경 (블랙 아님)
    destructiveTitle: "#FCA5A5", // 밝은 레드 타이틀
    destructiveText: "#FECACA", // 연한 레드 설명 텍스트
    infoText: "#c6d5df",
    disabledText: "#ffffffff",
  },
} as const;

export type ColorTheme = keyof typeof Colors;
export type ColorKeys = keyof typeof Colors.light;

// ========================================================================
//  2. 간격 (Spacing)
// ========================================================================
// margin, padding 등 컴포넌트 간 간격을 표준화합니다.
// 4의 배수를 사용하여 디자인의 일관성과 리듬감을 유지합니다.
// ========================================================================

export const Spacing = {
  xs: 4, // 아주 작은 간격
  sm: 8, // 작은 간격
  md: 16, // 중간 간격 (기본)
  lg: 24, // 큰 간격
  xl: 32, // 아주 큰 간격
  xxl: 48, // 화면 섹션 간격
} as const;

// ========================================================================
//  3. 폰트 (Fonts & FontSizes)
// ========================================================================
// 플랫폼(iOS, Android, Web)에 맞는 기본 폰트 패밀리를 정의하고,
// 의미에 따른 폰트 크기를 표준화하여 타이포그래피 계층을 만듭니다.
// ========================================================================

export const Fonts = Platform.select({
  ios: {
    sans: "System",
    serif: "Georgia",
    mono: "Menlo",
    juache: "BMJUA", // 배달의민족 주아체
    gmarketBold: "GmarketSansBold", // 지마켓 산스 Bold
    chab: "Chab", // Chab 폰트
    keriskedu: "KERISKEDU_B", // KERISKEDU Bold
  },
  android: {
    sans: "Roboto",
    serif: "serif",
    mono: "monospace",
    juache: "BMJUA", // 배달의민족 주아체
    gmarketBold: "GmarketSansBold", // 지마켓 산스 Bold
    chab: "Chab", // Chab 폰트
    keriskedu: "KERISKEDU_B", // KERISKEDU Bold
  },
  default: {
    sans: "sans-serif",
    serif: "serif",
    mono: "monospace",
    juache: "BMJUA", // 배달의민족 주아체
    gmarketBold: "GmarketSansBold", // 지마켓 산스 Bold
    chab: "Chab", // Chab 폰트
    samliphopangche: "SDSamliphopangcheTTFOutline", // 삼립호빵체 아웃라인
    keriskedu: "KERISKEDU_B", // KERISKEDU Bold
  },
});

export const FontSizes = {
  h1: 32, // 페이지 제목
  h2: 28,
  h3: 24,
  h4: 20,
  body: 16, // 본문 (기본)
  caption: 14, // 보조 텍스트
  small: 12, // 가장 작은 텍스트
} as const;

// ========================================================================
//  4. 테두리 (Borders)
// ========================================================================
// 컴포넌트의 모서리 둥글기(borderRadius)와 테두리 두께(borderWidth)를
// 표준화하여 일관된 모양을 유지합니다.
// ========================================================================

export const Borders = {
  radius: {
    sm: 8,
    md: 16, // 기본 둥글기
    lg: 24,
    full: 999, // 원형, 알약 형태 버튼
  },
  width: {
    sm: 1,
    md: 1.5,
  },
} as const;

// ========================================================================
//  5. 그림자 (Shadows)
// ========================================================================
// 카드, 버튼 등에 일관된 그림자 스타일을 적용하여 입체감을 줍니다.
// iOS(shadow*)와 Android(elevation) 스타일을 함께 정의합니다.
// ========================================================================

export const Shadows = {
  card: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  button: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },
} as const;

// ========================================================================
//  6. 전체 테마 객체 (Theme)
// ========================================================================
// 위에서 정의한 모든 스타일 가이드를 하나로 묶어 export합니다.
// 컴포넌트에서는 이 Theme 객체를 통해 스타일에 접근합니다.
// ========================================================================

export const Theme = {
  Colors,
  Spacing,
  Fonts,
  FontSizes,
  Borders,
  Shadows,
};

export default Theme;
