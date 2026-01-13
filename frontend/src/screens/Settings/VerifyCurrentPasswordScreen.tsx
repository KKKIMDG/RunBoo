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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { getStyles } from "./ChangePasswordScreen.styles";
import { verifyCurrentPassword } from "@/services/user/userService";
import { useUserMe } from "@/contexts/UserMeContext";
import {useSettings} from "@/screens/Settings/useSettings";
import {useResolvedTheme} from "@/hooks/useResolvedTheme";

export default function VerifyCurrentPasswordScreen({ navigation }: any) {
  const { userMe } = useUserMe();


  /** 일반 설정 */
  const { settings } = useSettings();
  const colorScheme = useResolvedTheme(settings?.themeMode);
  const styles = useMemo(() => {
    return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
  }, [colorScheme, settings?.fontSize]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [isHidden, setIsHidden] = useState(true);
  const [loading, setLoading] = useState(false);

  if (!userMe) {
    return null;
  }
  // LOCAL 계정만 접근
  // @ts-ignore
  if (userMe.provider !== "LOCAL") return null;

  const onSubmit = async () => {
    try {
      setLoading(true);

      // 비밀번호 검증
      await verifyCurrentPassword(currentPassword);

      // 검증 성공 → 다음 페이지
      navigation.navigate("ChangePassword");
    } catch (e: any) {
      Alert.alert(
        "비밀번호 오류",
        "입력한 비밀번호가 올바르지 않습니다.\n다시 확인해 주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  // @ts-ignore
  // @ts-ignore
  // @ts-ignore
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
            <Ionicons name="chevron-back" style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>비밀번호 확인</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 보안 안내 */}
          <View style={styles.noticeBox}>
            <Ionicons name="lock-closed-outline" style={styles.icon} />
            <View style={styles.noticeTextWrapper}>
              <Text style={styles.noticeTitle}>보안 확인</Text>
              <Text style={styles.noticeDesc}>
                사용자 확인을 위해 현재 비밀번호를 입력해 주세요.
              </Text>
            </View>
          </View>

          {/* 이메일 */}
          <View style={styles.emailRow}>
            <Ionicons name="mail-outline" style={styles.icon} />
            <Text style={styles.emailText}>{userMe.email}</Text>
          </View>

          {/* 입력 영역 */}
          <View style={styles.form}>
            <Text style={styles.label}>현재 비밀번호</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                key={isHidden ? "hidden" : "visible"}
                placeholder="현재 비밀번호를 입력하세요"
                secureTextEntry={isHidden}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                style={styles.input}
                textContentType="password"
                autoComplete="password"
              />
              <TouchableOpacity onPress={() => setIsHidden((v) => !v)}>
                <Ionicons
                  name={isHidden ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            </View>

            {/* 확인 버튼 */}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (currentPassword.length === 0 || loading) &&
                  styles.confirmButtonDisabled,
              ]}
              disabled={currentPassword.length === 0 || loading}
              onPress={onSubmit}
            >
              <Text style={styles.confirmButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
