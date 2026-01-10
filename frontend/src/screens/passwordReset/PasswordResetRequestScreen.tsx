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
import { requestPasswordReset } from "@/services/auth/passwordResetService";
import { getStyles } from "./PasswordReset.style";

export default function PasswordResetRequestScreen({ navigation }: any) {
    const scheme = useColorScheme() ?? "light";
    const styles = useMemo(() => getStyles(scheme), [scheme]);
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        if (!email.trim()) {
            Alert.alert("안내", "이메일을 입력하세요.");
            return;
        }
        setLoading(true);
        try {
            await requestPasswordReset(email.trim());
            navigation.navigate("PasswordResetVerify", { email });
        } catch (e: any) {
            Alert.alert("오류", e?.message ?? "잠시 후 다시 시도해 주세요.");
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
                {/* 헤더 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" style={styles.icon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>비밀번호 찾기</Text>
                    <View style={{ width: 24 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* 안내 박스 */}
                    <View style={styles.noticeBox}>
                        <Ionicons name="mail-outline" style={styles.icon} />
                        <View style={styles.noticeTextWrapper}>
                            <Text style={styles.noticeTitle}>이메일 인증</Text>
                            <Text style={styles.noticeDesc}>
                                가입하신 이메일을 입력하시면 인증 코드를 보내드립니다.
                            </Text>
                        </View>
                    </View>

                    {/* 입력 필드 */}
                    <Text style={styles.label}>이메일 주소</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        placeholder="example@runboo.com"
                        placeholderTextColor={scheme === "dark" ? "#6B7280" : "#9CA3AF"}
                        style={styles.input}
                    />
                </ScrollView>

                {/* 하단 고정 버튼 */}
                <TouchableOpacity
                    onPress={submit}
                    disabled={loading}
                    style={[styles.submitButton, loading && styles.disabledButton]}
                >
                    <Text style={styles.submitText}>
                        {loading ? "전송 중..." : "인증 코드 받기"}
                    </Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}