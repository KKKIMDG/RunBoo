import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#F8FAFC",
        paddingHorizontal: 20,
    },

    header: {
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },

    headerTitle: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#111827",
    },

    noticeBox: {
        flexDirection: "row",
        backgroundColor: "#EEF2FF",
        borderRadius: 14,
        padding: 14,
        marginBottom: 20,
    },

    noticeTextWrapper: {
        marginLeft: 10,
        flex: 1,
    },

    noticeTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#3A4A98",
        marginBottom: 4,
    },

    noticeDesc: {
        fontSize: 12,
        color: "#4B5563",
        lineHeight: 18,
    },

    form: {
        flex: 1,
    },

    label: {
        fontSize: 13,
        fontWeight: "600",
        color: "#111827",
        marginBottom: 6,
        marginTop: 12,
    },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FFF",
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 48,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },

    input: {
        flex: 1,
        fontSize: 14,
        color: "#111827",
    },
    scrollContent: {
        paddingBottom: 24,
    },

    submitButton: {
        height: 52,
        borderRadius: 16,
        backgroundColor: "#3A4A98",
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 20,
        marginBottom: 16,
    },

    disabledButton: {
        backgroundColor: "#CBD5E1",
    },

    submitText: {
        color: "#FFF",
        fontSize: 15,
        fontWeight: "600",
    },
    emailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },

    emailText: {
        marginLeft: 8,
        fontSize: 16,        // 존재감 있음
        fontWeight: "600",
        color: "#111827",
    },
    confirmButton: {
        flexDirection: "row",
        height: 56,
        borderRadius: 16,
        backgroundColor: "#3A4A98", // 메인 액션 컬러
        justifyContent: "center",
        alignItems: "center",
        marginTop: 24,
    },

    confirmButtonDisabled: {
        backgroundColor: "#E5E7EB",
    },

    confirmButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    helperText: {
        fontSize: 13,
        marginTop: 6,
    },

});
