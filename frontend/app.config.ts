import "dotenv/config";
import { ExpoConfig } from "expo/config";

export default (): ExpoConfig => ({
  name: "RunBoo",
  slug: "RunBoo",
  scheme: "runboo",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./src/assets/icon.png",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,

  splash: {
    image: "./src/assets/icon.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.runboo.frontend",
    googleServicesFile: "./frontSecrets/GoogleService-Info.plist",

    infoPlist: {
      UIBackgroundModes: ["location", "fetch"],
      NSLocationAlwaysAndWhenInUseUsageDescription:
        "러닝 기록을 정확하게 측정하기 위해 앱이 백그라운드에서도 위치 정보를 사용합니다.",
      NSLocationWhenInUseUsageDescription:
        "러닝 경로를 기록하기 위해 위치 정보가 필요합니다.",
      // 🏃‍♂️ iOS용 모션 권한 문구
      NSMotionUsageDescription:
        "러닝 중 걸음 수와 케이던스를 측정하기 위해 모션 데이터를 사용합니다.",
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
      },
    },

    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },

  android: {
    package: "com.runboo.frontend",
    googleServicesFile: "./frontSecrets/google-services.json",
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    adaptiveIcon: {
      foregroundImage: "./src/assets/icon.png",
      backgroundColor: "#ffffff",
    },
    permissions: [
      "ACCESS_COARSE_LOCATION",
      "ACCESS_FINE_LOCATION",
      "ACCESS_BACKGROUND_LOCATION",
      "FOREGROUND_SERVICE",
      "ACTIVITY_RECOGNITION", // ✅ 안드로이드 물리적 센서 권한
    ],
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },

  web: {
    favicon: "./src/assets/favicon.png",
  },

  plugins: [
    "expo-web-browser",
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "내 주변 러닝 코스를 찾기 위해 위치 정보 권한이 필요합니다.",
        isAndroidBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true,
      },
    ],

    // 🏃‍♂️ ✅ 이 부분을 아래와 같이 수정해야 합니다.
    [
      "expo-sensors",
      {
        motionPermission:
          "러닝 중 케이던스 측정을 위해 만보기 데이터 접근 권한이 필요합니다.",
      },
    ],

    "@react-native-firebase/app",
    [
      "expo-build-properties",
      {
        ios: {
          useFrameworks: "static",
        },
      },
    ],
  ],

  extra: {
    eas: {
      projectId: "af62ae63-0b7b-4b5b-b0e0-243b6984af08",
    },
  },

  owner: "lee-dimension",
});
