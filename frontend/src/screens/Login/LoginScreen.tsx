// screens/Login
// - LoginScreen.tsx: 로그인 UI 스크린(뷰 전용). 입력 폼, 버튼, 소셜 아이콘 포함.
// - Login.styles.ts: 이 스크린 전용 스타일 정의.
// 구현 팁: 뷰와 로직을 분리하여 `onLogin` / `onSignUp` 콜백을 사용하세요.

import React, { FC, useState } from 'react';
import { Alert, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from './Login.styles';
import { LinearGradient } from 'expo-linear-gradient';

interface LoginScreenProps {
  onLogin?: (id: string, pw: string) => void;
  onSignUp?: () => void;
}

const LoginScreen: FC<LoginScreenProps> = ({ onLogin, onSignUp }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if (!id || !password) {
      Alert.alert('알림', '아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    if (onLogin) onLogin(id, password);
    else Alert.alert('로그인', `로그인 시도: ${id}`);
  };

  const handleGoogleLogin = () => {
    Alert.alert('Google Login', '소셜 로그인은 비활성화 되어 있습니다.');
  };

  const handleKakaoLogin = () => {
    Alert.alert('Kakao Login', '소셜 로그인은 비활성화 되어 있습니다.');
  };

  return (
    <View style={styles.container}>
      <Image style={styles.icon} source={require('../../components/img/runboo.png')} resizeMode="contain" />

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>아이디</Text>
          <View style={styles.inputBox}>
            <TextInput style={styles.textInput} placeholder="아이디를 입력하세요" placeholderTextColor="#aaa" value={id} onChangeText={setId} autoCapitalize="none" />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호</Text>
          <View style={styles.inputBox}>
            <TextInput style={styles.textInput} placeholder="비밀번호를 입력하세요" placeholderTextColor="#aaa" value={password} onChangeText={setPassword} secureTextEntry />
          </View>
        </View>

        <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
          <View style={styles.loginButton}>
            <Text style={styles.loginButtonText}>로그인</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <View style={styles.orTextWrapper}><Text style={styles.orText}>or</Text></View>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialLoginContainer}>
        <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={handleGoogleLogin}>
          <Image style={styles.socialIcon} source={require('../../components/img/google.png')} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, styles.kakaoButton]} onPress={handleKakaoLogin}>
          <Image style={styles.socialIcon} source={require('../../components/img/kakao.png')} />
        </TouchableOpacity>
      </View>

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>계정이 없으신가요?</Text>
        <TouchableOpacity onPress={onSignUp} style={styles.signupButton}>
          <Text style={styles.signupButtonText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
