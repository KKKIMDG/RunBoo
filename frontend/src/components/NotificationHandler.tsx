// // @/components/NotificationHandler.tsx
// import { useEffect } from "react";
// import messaging from "@react-native-firebase/messaging";
// import { useBannerNotification } from "@/hooks/useBannerNotification";

// export function NotificationHandler() {
//     const { showBanner } = useBannerNotification();

//     useEffect(() => {
//         const unsubscribe = messaging().onMessage(async (remoteMessage) => {
//             console.log("포그라운드 알림 수신:", remoteMessage);
//             showBanner(remoteMessage);
//         });

//         return unsubscribe;
//     }, [showBanner]);

//     return null; // UI는 렌더링하지 않음
// }
