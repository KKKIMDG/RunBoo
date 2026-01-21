import { showMessage } from "react-native-flash-message";
import { useNavigation } from "@react-navigation/native";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// 알림 타입 정의 (백엔드/알림화면과 동일하게)
type NotificationType = "RUN_RESULT" | "CHALLENGE" | "REMINDER" | "EVENT";

export const useBannerNotification = () => {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();

    const showBanner = (remoteMessage: any) => {
        const { notification, data } = remoteMessage;
        if (!notification) return;

        const type = data?.type as NotificationType;

            // 타입별로 디자인과 유지 시간을 모두 정의
        const bannerConfig = ({
            RUN_RESULT: { color: "#2ecc71", icon: "success", duration: 5000, delay: 1000 }, // 결과는 중요하니까 5초
            CHALLENGE: { color: "#12397a", icon: "success", duration: 4000, delay: 3000 },  // 챌린지는 4초
            REMINDER: { color: "#f1c40f", icon: "info", duration: 2500 },     // 단순 리마인더는 짧게 2.5초
            EVENT: { color: "#e74c3c", icon: "warning", duration: 6000 },     // 이벤트 공지는 길게 6초
        } as const)[type] || { color: "#12397a", icon: "info" as const, duration: 3000 };

        showMessage({
            // 1. 텍스트 및 기본 내용
            message: notification.title || "새로운 알림",    // 배너의 굵은 제목 (FCM 제목이 없으면 기본값 출력)
            description: notification.body || "내용을 확인하세요.", // 제목 아래 상세 설명 (FCM 본문)

            // 2. 색상 및 테마 설정
            backgroundColor: bannerConfig.color,          // 알림 타입별로 미리 정의한 배경색 (예: #12397a)
            color: "#ffffff",                             // 텍스트(제목, 설명)의 글자 색상
            type: "info",                                 // 기본 테마 (backgroundColor가 우선 적용됨)

            // 3. 표시 및 지속 시간
            duration: bannerConfig.duration,                            // 배너가 화면에 머무르는 시간 (4000ms = 4초)
            position: "top",                              // 배너가 나타날 위치 (화면 상단)
            floating: true,                               // true일 경우 화면 끝에 붙지 않고 둥둥 떠 있는 스타일 적용

            // 4. 아이콘 설정
            icon: bannerConfig.icon as any,               // 왼쪽 아이콘 (success, info, warning, danger 중 매핑된 값)

            // 5. 레이아웃 및 디자인 커스텀 (핵심)
            style: {
                // 기기별 상태바(노치 등) 높이에 맞춰 배너의 시작 위치를 동적으로 조절
                // iOS는 insets.top만으로 충분하고, Android는 10px 정도 추가 여백을 줌
                marginTop: Platform.OS === 'ios' ? insets.top : insets.top + 10,

                marginHorizontal: 15,                       // 좌우 여백을 주어 배너가 화면 좌우 끝에 닿지 않게 함
                borderRadius: 12,                           // 배너의 모서리를 둥글게 깎음

                // 그림자 설정 (배너가 떠 있는 느낌을 줌)
                elevation: 5,                               // Android 전용 그림자 깊이
                shadowOpacity: 0.3,                         // iOS 전용 그림자 투명도 (선택 사항으로 추가 가능)
            },
            // 2. 알림 배너 클릭 시 이동 로직 (알림 화면의 onPress와 동일)
            onPress: () => {
                const parent = navigation.getParent();
                if (!parent) return;

                switch (type) {
                    case "RUN_RESULT":
                        navigation.navigate("MainTabs", { screen: "Record" });
                        break;
                    case "CHALLENGE":
                        navigation.navigate("MainTabs", { screen: "Challenge" });
                        break;
                    case "REMINDER":
                        navigation.navigate("MainTabs", { screen: "Home" });
                        break;
                    case "EVENT":
                        navigation.navigate("MainTabs", { screen: "Course" });
                        break;
                }
            },
        });
    };

    return { showBanner };
};