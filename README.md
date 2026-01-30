가장 트렌디한 런닝 앱.<br>
***--- RunBoo ---*** <br>
입니다. <br>

## 1. 서비스 관련 정보
### 서비스 개발 배경
런닝은 하나의 라이프스타일로 자리 잡으며 빠르게 성장하고 있습니다. <br>
하지만 현재 시중에 출시되어 있는 런닝 앱들은 기능과 경험 면에서 매우 한정적입니다. <br>

***RunBoo*** 는 단순한 기록을 넘어, <br>
런닝을 더 재미있고, 지속 가능하게 만들기 위해 탄생했습니다. <br>

가장 트렌디한 런닝 앱. ***RunBoo*** 와 함께 하세요.

### 주요 기능

**1. 티어** <br>
몇 키로를 몇 분에 뛰는지 다른 사람에게 더 이상 길게 설명할 필요가 없습니다. <br>
5km, 10km 의 런닝 기록을 측정하고 게임과 같이 티어를 부여받습니다. <br>
런부의 티어 만으로 런닝크루 가입 및 자기소개에 유용하게 사용할 수 있습니다. <br>

**2. 고스트** <br>
3가지의 런닝 모드 중 고스트 모드가 있습니다. <br>
고스트 모드를 통해서 자신의 직전 런닝 기록, 자신의 베스트 페이스 런닝 기록, 이번주 평균치 런닝 기록 그리고 전국 Top5 의 런닝 페이스로 <br>
함께 런닝을 뛸 수 있습니다. <br>
물론 티어와 고스트 같은 특별한 런닝 모드만 있는 것은 아닙니다. 일반 런닝 모드도 기본 제공됩니다. <br>

**3. 주변 러너 찾기** <br>
굳이 크루에 가입하지 않아도 당신은 혼자가 아닙니다. 운동화만 신고 나오세요.<br>
현재 위치를 기반으로 주변 러너들을 자동으로 찾아줍니다. <br>
주변 러너들과 자신의 페이스를 비교하고, 사용자 위치를 기반으로 주변 런닝 코스까지 추천해줍니다. <br>

**4. 통계와 AI 분석 리포트** <br>
런부는 단순히 런닝 기록을 남기는 것에서 끝나지 않습니다. <br>
주간 기록, 월간 기록을 시각화해서 보여줍니다. <br>
게다가 런부는 사용자의 월간 런닝 기록을 기반으로 AI 분석 리포트를 제공합니다. <br>
AI 와 함께 지난 런닝을 되돌아보고, 앞으로의 목표를 세워보세요. <br>

## 2. 개발 관련 정보

### Stack
[![My Skills](https://skillicons.dev/icons?i=spring,java,react,typescript,supabase,postgres,figma,git,github)](https://skillicons.dev)

### Frontend Styling & Theme

**RunBoo** 앱의 프론트엔드 스타일링은 일관성, 확장성, 그리고 유지보수성을 핵심 가치로 삼습니다. 이를 위해 중앙화된 디자인 시스템과 동적 스타일링 패턴을 도입했습니다.

#### 1. 중앙 디자인 시스템: `frontend/src/constants/theme.ts`

모든 디자인 관련 값(색상, 간격, 폰트, 테두리 등)은 `theme.ts` 파일에서 관리됩니다. 이 파일은 앱의 전체적인 룩앤필을 결정하는 **단일 진실 공급원(Single Source of Truth)** 역할을 합니다.

-   **Colors**: 라이트/다크 모드에 대응하는 시맨틱 색상 팔레트를 정의합니다. (예: `primary`, `background`, `text`)
-   **Spacing**: 일관된 간격(margin, padding)을 위한 값들을 정의합니다. (4의 배수 사용)
-   **Fonts & FontSizes**: 타이포그래피 계층을 위한 폰트 패밀리와 크기를 정의합니다.
-   **Borders**: 컴포넌트의 모서리 둥글기(radius)와 테두리 두께(width)를 표준화합니다.
-   **Shadows**: iOS와 Android에 일관된 그림자 스타일을 적용합니다.

> 컴포넌트 스타일링 시, 하드코딩된 값 대신 `theme.ts`의 값을 사용하는 것을 원칙으로 합니다.

#### 2. 동적 스타일링과 다크 모드 지원

다크 모드와 같이 상태에 따라 스타일이 변경되어야 하는 컴포넌트를 위해 동적 스타일링 패턴을 사용합니다.

**패턴:**

1.  **스타일 파일 분리**: 컴포넌트와 동일한 위치에 `[Component].styles.ts` 파일을 생성합니다.
2.  **`getStyles` 함수 작성**: 이 파일 안에 `getStyles` 함수를 `export` 합니다. 이 함수는 현재 `scheme`('light' 또는 'dark')을 인자로 받아 해당 테마에 맞는 `StyleSheet` 객체를 반환합니다.

    ```typescript
    // 예: MyComponent.styles.ts
    import { StyleSheet } from "react-native";
    import { Colors, Spacing } from "@/constants/theme";

    export const getStyles = (scheme: "light" | "dark") => {
      const colors = Colors[scheme];
      return StyleSheet.create({
        container: {
          backgroundColor: colors.background,
          padding: Spacing.md,
        },
        text: {
          color: colors.text,
        },
      });
    };
    ```

3.  **컴포넌트에서 스타일 적용**: 컴포넌트 내에서 `useColorScheme` 훅을 사용하여 현재 테마를 감지하고, `getStyles` 함수를 통해 동적으로 스타일을 적용합니다.

    ```tsx
    // 예: MyComponent.tsx
    import React from "react";
    import { View, Text } from "react-native";
    import { useColorScheme } from "@/hooks/use-color-scheme";
    import { getStyles } from "./MyComponent.styles";

    const MyComponent = () => {
      const colorScheme = useColorScheme() ?? "light";
      const styles = getStyles(colorScheme);

      return (
        <View style={styles.container}>
          <Text style={styles.text}>Hello, Themed World!</Text>
        </View>
      );
    };
    ```

이 패턴을 통해 각 컴포넌트는 자신의 스타일에 대한 책임을 가지면서도, 중앙 `theme` 시스템과 완벽하게 통합되어 앱 전체의 디자인 일관성을 유지하고 다크 모드를 효과적으로 지원할 수 있습니다.

### 개발진

**김동건** | PM, FullStack | [GitHub](https://github.com/KKKIMDG) <br>
**김다빈** | FullStack | [GitHub](https://github.com/i3inni) <br>
**김희곤** | FullStack | [GitHub](https://github.com/heegon02) <br>
**이차원** | FullStack | [GitHub](https://github.com/Lee-Dimension) <br>
