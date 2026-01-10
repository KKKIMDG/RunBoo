import React, { useState, useMemo } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
    useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
    requestPasswordReset,
    verifyPasswordResetCode,
} from "@/services/auth/passwordResetService";
import { getStyles } from "./PasswordReset.style";

export default function PasswordResetVerifyScreen({ navigation, route }: any) {
    const { email } = route.params;
    const scheme = useColorScheme() ?? "light";
    const styles = useMemo(() => getStyles(scheme), [scheme]);

    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    const resendCode = async () => {
        setResendLoading(true);
        try {
            await requestPasswordReset(email);
            Alert.alert("안내", "인증 코드가 다시 전송되었습니다.");
        } catch (e: any) {
            Alert.alert("오류", e?.message ?? "인증 코드 재전송에 실패했습니다.");
        } finally {
            setResendLoading(false);
        }
    };

    const submit = async () => {
        if (!code.trim()) {
            Alert.alert("안내", "인증 코드를 입력하세요.");
            return;
        }
        setLoading(true);
        try {
            const { resetToken } = await verifyPasswordResetCode(email, code.trim());
            navigation.navigate("PasswordResetChange", { resetToken });
        } catch (e: any) {
            Alert.alert("인증 실패", e?.message ?? "인증 코드가 올바르지 않습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" style={styles.icon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>인증 코드 확인</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.noticeBox}>
                        <Ionicons name="chatbubble-ellipses-outline" style={styles.icon} />
                        <View style={styles.noticeTextWrapper}>
                            <Text style={styles.noticeTitle}>코드 확인</Text>
                            <Text style={styles.noticeDesc}>
                                {email}로 전송된 6자리 코드를 입력해 주세요.
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.label}>인증 코드</Text>
                    <TextInput
                        value={code}
                        onChangeText={setCode}
                        keyboardType="number-pad"
                        placeholder="인증 코드 6자리"
                        placeholderTextColor={scheme === "dark" ? "#6B7280" : "#9CA3AF"}
                        style={styles.input}
                        maxLength={6}
                    />

                    <TouchableOpacity
                        onPress={resendCode}
                        disabled={resendLoading}
                        style={styles.secondaryButton}
                    >
                        <Text style={styles.secondaryButtonText}>
                            {resendLoading ? "재전송 중..." : "인증 코드를 못 받으셨나요?"}
                        </Text>
                    </TouchableOpacity>
                </ScrollView>

                <TouchableOpacity
                    onPress={submit}
                    disabled={loading}
                    style={[styles.submitButton, loading && styles.disabledButton]}
                >
                    <Text style={styles.submitText}>{loading ? "확인 중..." : "확인"}</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}