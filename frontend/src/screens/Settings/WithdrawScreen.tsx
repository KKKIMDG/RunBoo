import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { withdrawUser } from "@/services/user/withdrawService";
import { authEventBus } from "@/services/auth/authEvents";
import { styles } from "./WithdrawScreen.styles";
import { useUserMe } from "@/contexts/UserMeContext";

export default function WithdrawScreen({ navigation }: any) {
    const { userMe, logout } = useUserMe();

    if (!userMe) return null;

    const isLocal = userMe?.provider === "LOCAL";

    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    /**
     * 실제 탈퇴 처리
     */
    const submitWithdraw = async () => {
        try {
            if (isLocal && password.trim().length === 0) {
                Alert.alert("비밀번호를 입력해주세요");
                return;
            }

            setLoading(true);

            if (isLocal) {
                await withdrawUser({ password: password.trim() });
            } else {
                await withdrawUser();
            }

            Alert.alert(
                "계정 탈퇴 완료",
                "계정이 정상적으로 탈퇴되었습니다.",
                [
                    {
                        text: "확인",
                        onPress: logout,
                    },
                ]
            );
        } catch (e: any) {
            const message =
                e?.message ?? "계정 탈퇴 처리 중 오류가 발생했습니다.";

            Alert.alert("탈퇴 실패", message);
        }finally {
            setLoading(false);
        }
    };

    /**
     * 최종 확인 Alert
     */
    const handleWithdraw = () => {
        Alert.alert(
            "계정 탈퇴",
            "정말로 탈퇴하시겠습니까?\n탈퇴 후에는 모든 데이터가 삭제되며 복구할 수 없습니다.",
            [
                { text: "취소", style: "cancel" },
                {
                    text: "탈퇴하기",
                    style: "destructive",
                    onPress: submitWithdraw,
                },
            ]
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
            >
                {/* 헤더 */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back" size={22} color="#111" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>계정 탈퇴</Text>
                    <View style={{ width: 22 }} />
                </View>

                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* 경고 박스 */}
                    <View style={styles.noticeBox}>
                        <Ionicons
                            name="warning-outline"
                            size={18}
                            color="#DC2626"
                        />
                        <View style={styles.noticeTextWrapper}>
                            <Text style={styles.noticeTitle}>
                                계정 탈퇴 안내
                            </Text>
                            <Text style={styles.noticeDesc}>
                                탈퇴 시 모든 데이터는 복구할 수 없으며,
                                탈퇴 후 한 달간 동일 이메일로 재가입이
                                불가합니다.
                            </Text>
                        </View>
                    </View>

                    {/* 비밀번호 입력 (LOCAL 계정만) */}
                    {isLocal && (
                        <View style={styles.form}>
                            <Text style={styles.label}>비밀번호 확인</Text>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    placeholder="비밀번호를 입력하세요"
                                    secureTextEntry
                                    value={password}
                                    onChangeText={setPassword}
                                    style={styles.input}
                                    autoComplete="password"
                                    textContentType="password"
                                />
                            </View>
                        </View>
                    )}

                    {/* 탈퇴 버튼 */}
                    <TouchableOpacity
                        style={[
                            styles.withdrawButton,
                            (loading ||
                                (isLocal && password.trim().length === 0)) &&
                            styles.withdrawButtonDisabled,
                        ]}
                        disabled={
                            loading ||
                            (isLocal && password.trim().length === 0)
                        }
                        onPress={handleWithdraw}
                    >
                        <Text style={styles.withdrawButtonText}>
                            계정 탈퇴하기
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
