import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { requestPasswordReset } from "@/services/auth/passwordResetService";

export default function PasswordResetRequestScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async () => {
        const value = email.trim();

        if (!value) {
            Alert.alert("입력 형식 오류","이메일을 입력하세요.");
            return;
        }

        setLoading(true);
        try {
            // 1단계: 인증 코드 요청 (서비스에 위임)
            await requestPasswordReset(value);

            // 성공 시 2단계로 이동
            navigation.navigate("PasswordResetVerify", { email: value });
        } catch (e: any) {
            Alert.alert(
                "오류",
                e?.message ?? "잠시 후 다시 시도해주세요"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
                비밀번호 재설정
            </Text>

            <Text style={{ marginBottom: 8 }}>
                가입한 이메일을 입력하세요
            </Text>

            <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="example@runboo.com"
                style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 12,
                }}
            />

            <TouchableOpacity
                onPress={submit}
                disabled={loading}
                style={{
                    backgroundColor: "#111827",
                    paddingVertical: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    opacity: loading ? 0.6 : 1,
                }}
            >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                    {loading ? "전송 중..." : "인증 코드 받기"}
                </Text>
            </TouchableOpacity>
        </View>
    );
}
