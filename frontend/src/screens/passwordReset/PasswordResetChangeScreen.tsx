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
import { resetPassword } from "@/services/auth/passwordResetService";
import { getStyles } from "./PasswordReset.style";

export default function PasswordResetChangeScreen({ navigation, route }: any) {
    const { resetToken } = route.params;
    const scheme = useColorScheme() ?? "light";
    const styles = useMemo(() => getStyles(scheme), [scheme]);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const isPasswordRuleValid = password.length >= 6 && /[A-Za-z]/.test(password) && /\d/.test(password);
    const isMatch = password === confirmPassword && confirmPassword.length > 0;
    const isValid = isPasswordRuleValid && isMatch;

    const submit = async () => {
        setLoading(true);
        try {
            await resetPassword(resetToken, password.trim());
            Alert.alert("변경 완료", "비밀번호가 성공적으로 재설정되었습니다.", [
                {
                    text: "확인",
                    onPress: () => navigation.reset({ index: 0, routes: [{ name: "Login" }] }),
                },
            ]);
        } catch (e: any) {
            Alert.alert("실패", e?.message ?? "비밀번호 변경에 실패했습니다.");
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
                    <Text style={styles.headerTitle}>새 비밀번호 설정</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.noticeBox}>
                        <Ionicons name="shield-checkmark-outline" style={styles.icon} />
                        <View style={styles.noticeTextWrapper}>
                            <Text style={styles.noticeTitle}>보안 강화</Text>
                            <Text style={styles.noticeDesc}>
                                다른 사이트에서 사용하지 않는 안전한 비밀번호를 설정하세요.
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.label}>새 비밀번호</Text>
                    <TextInput
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        placeholder="영문, 숫자 포함 6자 이상"
                        placeholderTextColor={scheme === "dark" ? "#6B7280" : "#9CA3AF"}
                        style={styles.input}
                    />

                    <Text style={styles.label}>비밀번호 확인</Text>
                    <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        placeholder="다시 한번 입력하세요"
                        placeholderTextColor={scheme === "dark" ? "#6B7280" : "#9CA3AF"}
                        style={styles.input}
                    />
                </ScrollView>

                <TouchableOpacity
                    onPress={submit}
                    disabled={!isValid || loading}
                    style={[styles.submitButton, (!isValid || loading) && styles.disabledButton]}
                >
                    <Text style={styles.submitText}>
                        {loading ? "변경 중..." : "비밀번호 변경 완료"}
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}