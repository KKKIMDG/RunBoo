import { StyleSheet } from "react-native";
import {Borders, Colors, Shadows} from "@/constants/theme";

export const getStyles = (scheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      height: 56,
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
    },

    borderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: Colors[scheme].border,
    },

    disabled: {
      opacity: 0.6,
    },

    leftContent: {
      flexDirection: "row",
      alignItems: "center",
    },

    icon: {
      marginRight: 12,
      color: Colors[scheme].icon,
    },

    iconDisabled: {
      color: Colors[scheme].muted,
    },

    label: {
      fontSize: 15,
      fontWeight: "500",
      color: Colors[scheme].text,
    },

    labelDisabled: {
      color: Colors[scheme].muted,
    },

    rightContent: {
      flexDirection: "row",
      alignItems: "center",
    },

    valueText: {
      fontSize: 14,
      marginRight: 4,
      color: Colors[scheme].infoText,
    },

    valueDisabled: {
      color: Colors[scheme].muted,
    },

    chevron: {
      color: Colors[scheme].text,
    },

    /** ===== switch ===== */
    switchHitArea: {
      paddingHorizontal: 12,
      paddingVertical: 10,
    },

    switchTrack: {
      width: 32,
      height: 18,
      borderRadius: 10,
      justifyContent: "center",
      paddingHorizontal: 2,
    },

    switchTrackOn: {
      backgroundColor: Colors[scheme].primary,
    },

    switchTrackOff: {
      backgroundColor: Colors[scheme].border,
    },

    switchThumb: {
      width: 13,
      height: 13,
      borderRadius: 6,
      backgroundColor: Colors[scheme].white,
      elevation: 1,
      shadowColor: Colors[scheme].shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 1,
    },
  });
