import React, { useMemo, useState } from "react";
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

import { getStyles } from "./ChangePasswordScreen.styles";
import { changePassword } from "@/services/user/userService";
import { useUserMe } from "@/contexts/UserMeContext";
import {useSettings} from "@/screens/Settings/useSettings";

export default function ChangePasswordScreen({ navigation }: any) {
  const { userMe, logout } = useUserMe();

  /** 일반 설정 */
  const { settings } = useSettings();
  const colorScheme = useColorScheme() ?? "light";
  const styles = useMemo(() => {
    return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
  }, [colorScheme, settings?.fontSize]);

  /**
   * 🔒 이 화면은 userMe가 존재할 때만 렌더됨
   * - 로그아웃 순간
   * - 토큰 만료
   * - 강제 로그아웃
   * 시 마지막 1프레임 크래시 방지
   */
  if (!userMe) {
    return null;
  }

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isHiddenNew, setIsHiddenNew] = useState(true);
  const [isHiddenConfirm, setIsHiddenConfirm] = useState(true);

  /* =====================
       비밀번호 규칙 체크
    ===================== */
  const hasMinLength = newPassword.length >= 6;
  const hasLetter = /[A-Za-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);

  const isPasswordRuleValid = hasMinLength && hasLetter && hasNumber;

  /* =====================
       비밀번호 일치 체크
    ===================== */
  const isPasswordMatch =
    confirmPassword.length > 0 && newPassword === confirmPassword;

  const isValid = isPasswordRuleValid && isPasswordMatch;

  /* =====================
       비밀번호 변경 처리
    ===================== */
  const onSubmit = async () => {
    try {
      await changePassword(newPassword);

      Alert.alert(
        "비밀번호 변경 완료",
        "비밀번호가 변경되었습니다.\n다시 로그인해 주세요.",
        [
          {
            text: "확인",
            onPress: logout, // 🔑 Root가 로그인 화면으로 전환
          },
        ]
      );
    } catch (e: any) {
      Alert.alert(
        "비밀번호 변경 실패",
        e?.message ?? "잠시 후 다시 시도해 주세요."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* ================= 헤더 ================= */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>비밀번호 변경</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ================= 보안 안내 ================= */}
          <View style={styles.noticeBox}>
            <Ionicons name="lock-closed-outline" style={styles.icon} />
            <View style={styles.noticeTextWrapper}>
              <Text style={styles.noticeTitle}>보안 팁</Text>
              <Text style={styles.noticeDesc}>
                영문과 숫자를 포함한 6자 이상의 비밀번호를 사용하세요.
              </Text>
            </View>
          </View>

          {/* ================= 입력 영역 ================= */}
          <View style={styles.form}>
            {/* 새 비밀번호 */}
            <Text style={styles.label}>새 비밀번호</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                key={isHiddenNew ? "new-hidden" : "new-visible"}
                placeholder="새 비밀번호를 입력하세요"
                secureTextEntry={isHiddenNew}
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
                textContentType="newPassword"
                autoComplete="password-new"
              />
              <TouchableOpacity onPress={() => setIsHiddenNew((v) => !v)}>
                <Ionicons
                  name={isHiddenNew ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {newPassword.length > 0 && (
              <Text
                style={[
                  styles.helperText,
                  {
                    color: isPasswordRuleValid ? "#16A34A" : "#EF4444",
                  },
                ]}
              >
                {isPasswordRuleValid
                  ? "사용 가능한 비밀번호입니다."
                  : "영문과 숫자를 포함한 6자 이상의 비밀번호를 사용하세요."}
              </Text>
            )}

            {/* 새 비밀번호 확인 */}
            <Text style={styles.label}>새 비밀번호 확인</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                key={isHiddenConfirm ? "confirm-hidden" : "confirm-visible"}
                placeholder="새 비밀번호를 다시 입력하세요"
                secureTextEntry={isHiddenConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
                textContentType="password"
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setIsHiddenConfirm((v) => !v)}>
                <Ionicons
                  name={isHiddenConfirm ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {confirmPassword.length > 0 && (
              <Text
                style={[
                  styles.helperText,
                  {
                    color: isPasswordMatch ? "#16A34A" : "#EF4444",
                  },
                ]}
              >
                {isPasswordMatch
                  ? "비밀번호가 일치합니다."
                  : "비밀번호가 일치하지 않습니다."}
              </Text>
            )}
          </View>
        </ScrollView>

        {/* ================= 하단 버튼 ================= */}
        <TouchableOpacity
          style={[styles.submitButton, !isValid && styles.disabledButton]}
          disabled={!isValid}
          onPress={onSubmit}
        >
          <Text style={styles.submitText}>비밀번호 변경</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
