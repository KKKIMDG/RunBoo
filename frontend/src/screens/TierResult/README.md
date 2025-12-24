# TierResult 화면

## 1. 개요

`TierResult` 화면은 사용자의 러닝 기록을 바탕으로 서버로부터 티어(Tier)를 평가받아 그 결과를 보여주는 화면입니다. 평가된 티어의 이름과 상징적인 이미지를 화면 상단에 보여주고, 하단에는 러닝 분석 결과와 다른 화면으로 이동할 수 있는 버튼들을 제공합니다.

## 2. 폴더 구조 및 파일 설명

```
TierResult/
├── TierResult.styles.ts  # 화면의 스타일링
├── TierResultScreen.tsx  # 화면의 UI와 핵심 로직
├── index.ts              # 컴포넌트 export
└── README.md             # (현재 파일)
```

---

### `TierResultScreen.tsx`

**역할**: 화면의 UI 렌더링과 핵심 비즈니스 로직을 담당합니다.

**주요 기능**:

-   **상태 관리**: `useState`를 사용하여 `loading`(로딩 중), `error`(에러 발생), `tierData`(서버로부터 받은 티어 정보) 상태를 관리합니다.
-   **데이터 요청**: `useEffect` 훅을 사용하여 컴포넌트가 마운트될 때 `fetchTier` 함수를 한 번만 호출합니다.
    -   `fetchTier` 함수는 `tierService.ts`의 `evaluateTier`를 호출하여 서버에 티어 평가를 요청합니다.
    -   **[주의]** 현재는 `distanceType: "5k"`, `recordId: 3`과 같이 **하드코딩된 값**으로 요청을 보내고 있습니다. 실제 사용 시에는 이전 화면에서 받은 동적인 데이터로 수정해야 합니다.
-   **조건부 렌더링**: `loading`, `error` 상태에 따라 로딩 인디케이터, 에러 메시지, 또는 결과 화면을 선택적으로 보여줍니다.
-   **데이터 시각화**:
    -   서버로부터 받은 `tierData`의 `displayName`과 `imageUrl`을 화면에 렌더링합니다.
    -   `imageUrl`은 `/tier/image/shoes.png`와 같은 상대 경로이므로, `SERVER_URL`과 조합하여 전체 이미지 주소를 만듭니다.
    -   **[주의]** 현재 러닝 분석 결과(거리, 시간, 페이스)는 `dummyStats`라는 **임시 데이터**를 사용하고 있습니다. 실제 기록 데이터와 연동이 필요합니다.
-   **사용자 인터랙션**:
    -   `handleShare`: React Native의 `Share` API를 사용하여 러닝 결과를 공유하는 기능을 제공합니다.
    -   `handleGoHome`: 홈 화면으로 돌아가는 네비게이션 로직을 처리합니다. (현재는 `Alert`만 표시)

---

### `TierResult.styles.ts`

**역할**: `TierResultScreen` 컴포넌트의 모든 UI 스타일을 정의합니다.

-   `StyleSheet.create`를 사용하여 스타일 객체를 생성하고 관리의 효율성을 높입니다.
-   화면은 크게 `topSection`(티어 정보)과 `bottomSheet`(분석 결과) 두 부분으로 나뉘며, 각 섹션에 대한 스타일이 명확하게 구분되어 있습니다.
-   `Dimensions`를 사용하여 기기 화면 크기에 반응하는 스타일을 일부 구현하고, `position: 'absolute'`를 활용하여 복잡한 레이아웃을 구성합니다.

---

### `index.ts`

**역할**: `TierResultScreen` 컴포넌트를 폴더의 기본 `export`로 지정합니다.

-   이를 통해 다른 파일에서 `TierResult` 폴더를 참조할 때 다음과 같이 간결하게 컴포넌트를 불러올 수 있습니다.
    ```javascript
    // import TierResultScreen from '../screens/TierResult/TierResultScreen'; (X)
    import TierResultScreen from '../screens/TierResult'; // (O)
    ```

## 3. API 연동 및 데이터 흐름

`TierResult` 화면의 데이터는 다음과 같은 흐름으로 서버와 통신합니다.

**흐름**: `TierResultScreen.tsx` ➡️ `tierService.ts` ➡️ `api.ts` ➡️ **API 서버**

---

### `api.ts` (API 클라이언트)

**위치**: `src/services/api.ts`

**역할**: 앱의 모든 HTTP 통신을 중앙에서 관리하는 범용 API 클라이언트입니다.

-   `BASE_URL`: API 서버의 기본 주소를 정의합니다. 현재 `http://localhost:8080`으로 하드코딩되어 있으며, 향후 `.env`와 같은 환경 변수로 분리하는 것이 권장됩니다.
-   `api.get`, `api.post`: `fetch` API를 기반으로 만들어진 래퍼(wrapper) 함수입니다.
    -   `POST` 요청 시 `Content-Type` 헤더를 `application/json`으로 자동 설정하고, `body`를 `JSON.stringify` 처리합니다.
    -   `res.ok`가 `false`일 경우, 즉 HTTP 상태 코드가 2xx가 아닐 경우 에러를 발생시켜 일관된 에러 처리를 돕습니다.

---

### `tierService.ts` (티어 서비스)

**위치**: `src/services/tierService.ts`

**역할**: '티어(Tier)'와 관련된 API 로직을 모아놓은 서비스 파일입니다.

-   `evaluateTier(requestData)`: 티어 평가를 요청하는 비동기 함수입니다.
    -   **인자**: `requestData`는 `TierEvaluationRequest` 타입({ `distanceType`: string, `recordId`: number })의 객체를 받습니다.
    -   **동작**: `api.post('/api/tier/evaluate', requestData)`를 호출하여 서버에 티어 평가를 요청합니다. `api.post`는 `requestData` 객체를 JSON 문자열로 변환하여 요청의 본문(body)에 담아 전송합니다.
    -   **반환**: 서버로부터 받은 응답을 `Promise<TierData>` 형태로 반환합니다. `TierData`는 `types/tier.ts`에 정의된 타입입니다.

---

### 데이터 흐름 요약

1.  `TierResultScreen`이 렌더링되면 `useEffect`가 `tierService.ts`의 `evaluateTier` 함수를 호출합니다.
2.  `evaluateTier`는 `api.ts`의 `api.post`를 사용하여 `http://localhost:8080/api/tier/evaluate` 엔드포인트로 POST 요청을 보냅니다.
3.  `api.ts`는 요청 데이터를 JSON으로 변환하여 서버로 전송합니다.
4.  서버는 `distanceType`과 `recordId`를 기반으로 티어를 평가하고, 결과(티어 이름, 이미지 URL 등)를 JSON 형식으로 응답합니다.
5.  `TierResultScreen`은 `await`을 통해 응답 데이터를 받아 `tierData` 상태에 저장하고, UI를 새롭게 렌더링하여 사용자에게 결과를 보여줍니다.
6.  이때, `tierData.imageUrl`은 상대 경로이므로 화면의 `SERVER_URL` 상수와 결합되어 최종 이미지 주소가 완성됩니다.
