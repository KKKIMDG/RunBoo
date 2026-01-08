import 'dotenv/config';
import { ExpoConfig } from 'expo/config';

export default (): ExpoConfig => ({
  name: 'RunBoo',
  slug: 'RunBoo',
  scheme: 'runboo',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './src/assets/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,

  splash: {
    image: './src/assets/icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.runboo.frontend',
    googleServicesFile: './frontSecrets/GoogleService-Info.plist',
    infoPlist: {
      UIBackgroundModes: ['location', 'fetch'],
      NSLocationAlwaysAndWhenInUseUsageDescription:
          '러닝 기록을 정확하게 측정하기 위해 앱이 백그라운드에서도 위치 정보를 사용합니다.',
      NSLocationWhenInUseUsageDescription:
          '러닝 경로를 기록하기 위해 위치 정보가 필요합니다.',
    },
    // Google Maps를 iOS에서 쓸 경우 대비
    config: {
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
    },
  },

  android: {
    package: 'com.runboo.frontend',
    googleServicesFile: './frontSecrets/google-services.json',
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    adaptiveIcon: {
      foregroundImage: './src/assets/icon.png',
      backgroundColor: '#ffffff',
    },
    permissions: [
      'ACCESS_COARSE_LOCATION',
      'ACCESS_FINE_LOCATION',
      'ACCESS_BACKGROUND_LOCATION',
      'FOREGROUND_SERVICE',
    ],
    config: {
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
  },

  web: {
    favicon: './src/assets/favicon.png',
  },

  plugins: [
    'expo-web-browser',
    [
      'expo-location',
      {
        locationWhenInUsePermission:
            '내 주변 러닝 코스를 찾기 위해 위치 정보 권한이 필요합니다.',
        isAndroidBackgroundLocationEnabled: true,
        isAndroidForegroundServiceEnabled: true,
      },
    ],
  ],

  extra: {
    eas: {
      projectId: 'af62ae63-0b7b-4b5b-b0e0-243b6984af08',
    },
  },

  owner: 'lee-dimension',
});
