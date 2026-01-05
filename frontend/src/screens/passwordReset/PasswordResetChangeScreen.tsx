import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import { resetPassword } from "@/services/auth/passwordResetService";

export default function PasswordResetChangeScreen({ navigation, route }: any) {
    const { resetToken } = route.params;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    /**
     * 비밀번호 변경
     */
    const submit = async () => {
        const pw = password.trim();
        const confirm = confirmPassword.trim();

        if (!pw || !confirm) {
            Alert.alert("안내", "비밀번호를 모두 입력하세요.");
            return;
        }

        if (pw !== confirm) {
            Alert.alert("오류", "비밀번호가 서로 일치하지 않습니다.");
            return;
        }

        if (pw.length < 6) {
            Alert.alert("오류", "비밀번호는 6자 이상이어야 합니다.");
            return;
        }
        if (pw.includes(" ")) {
            Alert.alert("오류", "비밀번호에는 공백을 사용할 수 없습니다.");
            return;
        }


        setLoading(true);
        try {
            await resetPassword(resetToken, pw);

            Alert.alert("완료", "비밀번호가 변경되었습니다.", [
                {
                    text: "확인",
                    onPress: () => {
                        navigation.reset({
                            index: 0,
                            routes: [{ name: "Login" }],
                        });
                    },
                },
            ]);
        } catch (e: any) {
            Alert.alert(
                "실패",
                e?.message ?? "비밀번호 변경에 실패했습니다."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
    <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
    새 비밀번호 설정
    </Text>

    <Text style={{ marginBottom: 16 }}>
    새로 사용할 비밀번호를 입력하세요
    </Text>

    <TextInput
    value={password}
    onChangeText={setPassword}
    placeholder="새 비밀번호"
    secureTextEntry
    style={{
        borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 10,
            padding: 12,
            marginBottom: 12,
    }}
    />

    <TextInput
    value={confirmPassword}
    onChangeText={setConfirmPassword}
    placeholder="새 비밀번호 확인"
    secureTextEntry
    style={{
        borderWidth: 1,
            borderColor: "#ddd",
            borderRadius: 10,
            padding: 12,
            marginBottom: 16,
    }}
    />

    {/* 비밀번호 변경 버튼 */}
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
    {loading ? "변경 중..." : "비밀번호 변경"}
    </Text>
    </TouchableOpacity>
    </View>
);
}
