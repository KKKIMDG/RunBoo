import { StyleSheet, Platform } from "react-native";
import { Colors } from "@/constants/theme";
import { FontSizeSetting, scaleFont } from "@/utils/fontScale";

export const getStyles = (
  scheme: "light" | "dark",
  fontSize: FontSizeSetting,
) => {
  const shadow = Platform.select({
    ios: {
      shadowColor: Colors[scheme].shadow,
      shadowOpacity: 0.08,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },
    android: { elevation: 4 },
    default: {},
  });

  const shadow2 = Platform.select({
    ios: {
      shadowColor: Colors[scheme].shadow,
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
    },
    android: { elevation: 3 },
    default: {},
  });

  return StyleSheet.create({
    safe: { flex: 1 },
    contentContainer: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: 0,
    },

    header: {
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderBottomWidth: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },

    headerPill: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 13,
      borderWidth: 1,
      ...shadow,
    },
    headerPillText: {
      fontWeight: "800",
      fontSize: scaleFont(13, fontSize),
      marginLeft: 6,
      marginRight: 6,
    },

    headerMiniPill: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 999,
      borderWidth: 1,
      ...shadow,
    },

    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 999,
      marginRight: 8,
    },

    card: {
      padding: 14,
      marginBottom: 12,
      marginHorizontal: -16,
      paddingHorizontal: 16,
      backgroundColor: Colors[scheme].background,
      borderWidth: 0,
    },
    cardTopRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    cardTitle: { fontWeight: "900", fontSize: scaleFont(14, fontSize) },

    badge: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 },
    badgeText: { fontWeight: "900", fontSize: scaleFont(12, fontSize) },

    rankRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    rankLabel: { fontSize: scaleFont(12, fontSize), fontWeight: "700" },
    rankValue: { fontSize: scaleFont(12, fontSize), fontWeight: "700" },

    gaugeTrack: {
      height: 10,
      borderRadius: 999,
      overflow: "hidden",
      marginTop: 10,
    },
    gaugeFill: { height: "100%", borderRadius: 999 },

    progressMarks: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 10,
    },
    mark: { fontSize: scaleFont(11, fontSize), fontWeight: "700" },

    statsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      gap: 12,
      marginBottom: 12,
    },

    small: { fontSize: scaleFont(11, fontSize), fontWeight: "700" },

    mapContainer: {
      flex: 1,
      borderRadius: 0,
      overflow: "visible",
      marginBottom: 0,
      marginHorizontal: 0,
      marginTop: 0,
      backgroundColor: Colors[scheme].background,
      position: "relative",
    },

    locationButton: {
      position: "absolute",
      right: 15,
      bottom: 15,
      width: 45,
      height: 45,
      borderRadius: 22.5,
      justifyContent: "center",
      alignItems: "center",
      elevation: 5,
      zIndex: 10,
    },

    controls: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 12,
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 16,
    },

    pauseBtn: {
      flex: 1,
      height: 56,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors[scheme].card ?? "#FFF",
      ...shadow2,
    },

    stopBtn: {
      flex: 1,
      height: 56,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      ...shadow2,
    },

    buttonText: {
      fontSize: scaleFont(15, fontSize),
      fontWeight: "700",
    },

    buttonTextWhite: {
      fontSize: scaleFont(15, fontSize),
      fontWeight: "700",
      color: "#FFFFFF",
    },

    countdownOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      zIndex: 999,
      elevation: 999,
    },
    countdownText: { fontSize: scaleFont(120, fontSize), fontWeight: "900" },
    countdownLabel: { fontSize: scaleFont(20, fontSize), marginTop: 12 },
  });
};
