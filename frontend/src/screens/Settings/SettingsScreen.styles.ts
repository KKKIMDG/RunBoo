import {Borders, Colors, Shadows} from "@/constants/theme";
import { StyleSheet } from "react-native";
import { scaleFont, FontSizeSetting } from "@/utils/fontScale";

export const getStyles = (
    scheme: "light" | "dark",
    fontSize: FontSizeSetting
) =>  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: Colors[scheme].background,

    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 60,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors[scheme].border,
    },
    headerTitle: {
      fontSize: scaleFont(18, fontSize),
      fontWeight: "800",
      color: Colors[scheme].text,
    },
    backButton: {
      position: "absolute",
      left: 15,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 40,
    },
    section: {
      marginBottom: 24,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      paddingLeft: 4,
    },
    sectionTitle: {
      fontSize: scaleFont(13, fontSize),
      fontWeight: "700",
      color: Colors[scheme].text,
      marginLeft: 6,
    },
    card: {
      backgroundColor: Colors[scheme].card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Colors[scheme].border,
      overflow: "hidden",
      shadowColor: Colors[scheme].shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    logoutButton: {
      flexDirection: "row",
      height: 56,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: "rgba(251, 44, 54, 0.2)",
      backgroundColor: Colors[scheme].card,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 100,
    },
    logoutText: {
      fontSize: scaleFont(15, fontSize),
      fontWeight: "700",
      color: "#FF6467",
      marginLeft: 8,
    },
    helperText: {
      fontSize: scaleFont(13, fontSize),
      marginTop: 6,
    },
    textButton: {
      fontSize: scaleFont(13, fontSize),
      color: "#9CA3AF",
      textDecorationLine: "underline",
    },
    openBackground: {
      backgroundColor: Colors[scheme].background,
      shadowColor: Colors[scheme].shadow,
    },
    icon:{
        color: Colors[scheme].icon,
        fontSize: scaleFont(22, fontSize),
    },
      dropdownContainer: {
          position: "absolute",
          backgroundColor: Colors[scheme].card,
          borderRadius: Borders.radius.md,
          borderWidth: 1,
          borderColor: Colors[scheme].border,
          minWidth: 160,
          ...Shadows.card,
      },

      dropdownItem: {
          height: 48,
          justifyContent: "center",
          paddingHorizontal: 18,
      },

      dropdownItemText: {
          fontSize: scaleFont(15, fontSize),
          color: Colors[scheme].text,
      },

      dropdownItemDisabled: {
          color: Colors[scheme].muted,
      },
  });
