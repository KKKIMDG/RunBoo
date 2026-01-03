import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import {
    requestPasswordReset,
    verifyPasswordResetCode,
} from "@/services/auth/passwordResetService";

export default function PasswordResetVerifyScreen({ navigation, route }: any) {
    const { email } = route.params;

    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);

    /**
     * 인증 코드 재전송
     */
    const resendCode = async () => {
        setResendLoading(true);
        try {
            await requestPasswordReset(email);
            Alert.alert("안내", "인증 코드가 다시 전송되었습니다.");
        } catch (e: any) {
            Alert.alert(
                "오류",
                e?.message ?? "인증 코드 재전송에 실패했습니다."
            );
        } finally {
            setResendLoading(false);
        }
    };

    /**
     * 인증 코드 확인
     */
    const submit = async () => {
        const value = code.trim();

        if (!value) {
            Alert.alert("인증 코드를 입력하세요");
            return;
        }

        setLoading(true);
        try {
            const { resetToken } = await verifyPasswordResetCode(email, value);

            // 3단계로 이동 (resetToken 전달)
            navigation.navigate("PasswordResetChange", {
                resetToken,
            });
        } catch (e: any) {
            Alert.alert(
                "인증 실패",
                e?.message ?? "인증 코드가 올바르지 않습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
                인증 코드 입력
            </Text>

            <Text style={{ marginBottom: 8 }}>
                {email}로 전송된 인증 코드를 입력하세요
            </Text>

            <TextInput
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                placeholder="6자리 인증 코드"
                style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 12,
                }}
            />

            {/* 인증 코드 확인 */}
            <TouchableOpacity
                onPress={submit}
                disabled={loading}
                style={{
                    backgroundColor: "#111827",
                    paddingVertical: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    opacity: loading ? 0.6 : 1,
                    marginBottom: 12,
                }}
            >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                    {loading ? "확인 중..." : "확인"}
                </Text>
            </TouchableOpacity>

            {/* 인증 코드 재전송 */}
            <TouchableOpacity
                onPress={resendCode}
                disabled={resendLoading}
                style={{
                    alignItems: "center",
                    paddingVertical: 8,
                }}
            >
                <Text
                    style={{
                        color: resendLoading ? "#9ca3af" : "#2563eb",
                        fontWeight: "600",
                    }}
                >
                    {resendLoading ? "재전송 중..." : "인증 코드 다시 받기"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
