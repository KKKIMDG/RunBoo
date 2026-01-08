import React, { useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Text,
  Platform,
  GestureResponderEvent,
  Alert,
} from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  useIsFocused,
} from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useNearbyRunners } from "@/hooks/useNearbyRunners";

interface RunnerProfile {
  userId: number;
  nickname: string;
  latitude: number;
  longitude: number;
  profileImageUrl?: string;
  currentDistance?: number;
  currentPace?: string;
  runningTime?: string;
}

export default function MapFullScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { location } = route.params || {};

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const isFocused = useIsFocused();
  const { nearbyRunners } = useNearbyRunners(isFocused);

  const [selectedRunner, setSelectedRunner] = useState<RunnerProfile | null>(
    null
  );

  const handleMapPress = () => {
    setSelectedRunner(null);
  };

  const mapRef = useRef<MapView>(null);

  const handleMoveToCurrentLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateCamera(
        {
          center: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          zoom: 16,
          pitch: 0,
          heading: 0,
        },
        { duration: 500 }
      );
    } else {
      Alert.alert("알림", "현재 위치를 불러올 수 없습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={mapRef}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || 37.5665,
          longitude: location?.coords.longitude || 126.978,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={true}
        showsMyLocationButton={false}
        onPress={handleMapPress}
      >
        {nearbyRunners.map((runner) => (
          <Marker
            key={runner.userId}
            coordinate={{
              latitude: runner.latitude,
              longitude: runner.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedRunner(runner);
            }}
          >
            <View style={styles.markerContainer}>
              {runner.profileImageUrl ? (
                <Image
                  source={{ uri: runner.profileImageUrl }}
                  style={styles.markerImage}
                />
              ) : (
                <Ionicons name="person" size={24} color="#4A90E2" />
              )}
            </View>
          </Marker>
        ))}
      </MapView>

      {/* 🔝 상단 버튼 영역 */}
      <SafeAreaView style={styles.headerContainer} pointerEvents="box-none">
        <View style={styles.headerRow}>
          {/* 뒤로가기 */}
          <TouchableOpacity
            style={[styles.roundButton, { backgroundColor: colors.card }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* 현재 위치 버튼 (우측 상단) */}
          <TouchableOpacity
            style={[styles.roundButton, { backgroundColor: colors.card }]}
            onPress={handleMoveToCurrentLocation}
          >
            <MaterialIcons name="my-location" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {selectedRunner && (
        <View style={[styles.runnerCard, { backgroundColor: colors.card }]}>
          {/* 카드 내용은 기존 그대로 */}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: "100%", height: "100%" },

  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },

  markerContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4A90E2",
  },

  markerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  runnerCard: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    borderRadius: 24,
    padding: 20,
  },
});
