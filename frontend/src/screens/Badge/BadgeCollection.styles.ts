// src/screens/Profile/BadgeCollection.styles.ts
import { StyleSheet, Dimensions } from "react-native";
import { Colors } from "@/constants/theme";

const { height } = Dimensions.get("window");

export const getStyles = (scheme: "light" | "dark") =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: "flex-end",
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    modalContent: {
      backgroundColor: Colors[scheme].background,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      height: height * 0.5, // 화면의 70% 높이
      paddingHorizontal: 20,
      paddingTop: 10,
    },
    indicator: {
      width: 40,
      height: 5,
      backgroundColor: Colors[scheme].secondaryBackground,
      borderRadius: 3,
      alignSelf: "center",
      marginBottom: 15,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
      paddingHorizontal: 5,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: Colors[scheme].text,
      marginTop: 5,
    },
    closeButton: {
      padding: 5,
    },
    listContent: {
      paddingBottom: 40,
      alignItems: "center",
    },
    badgeItem: {
      width: (Dimensions.get("window").width - 80) / 3,
      alignItems: "center",
      marginBottom: 25,
      marginHorizontal: 10,
    },
    badgeIconContainer: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: scheme === "dark" ? "#1C1C1E" : "#F1F3F9",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
      borderWidth: 1,
      borderColor: "rgba(58, 74, 152, 0.1)",
    },
    badgeName: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors[scheme].text,
      textAlign: "center",
      marginBottom: 2,
    },
    badgeDate: {
      fontSize: 10,
      color: "#868E96",
      textAlign: "center",
    },
    emptyText: {
      marginTop: 50,
      color: "#868E96",
      textAlign: "center",
    },
  });
