// screens/Login/LoginScreen.tsx

import React, { FC, useState } from 'react';
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { styles } from '../styles/Login.styles';
import { AuthService } from '@/services/auth/authService';
import { setAccessToken } from '@/services/api';

// ★ 1. 추가된 임포트 (토큰 해독기 & 저장소)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

interface LoginScreenProps {
  navigation: any;
  onLoginSuccess: (token: string) => void;
}

const LoginScreen: FC<LoginScreenProps> = ({ navigation, onLoginSuccess }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  // 로그인 처리 (API 호출 + 토큰 처리 + 페이지 전환)
  const handleLogin = async () => {
    if (!id || !password) {
      Alert.alert('알림', '아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      const res = await AuthService.login({
        email: id,
        password,
      });

      // ★ 2. 여기서 토큰을 뜯어서 ID를 저장합니다!
      if (res.accessToken) {
        // (1) 토큰 해독
        const decoded: any = jwtDecode(res.accessToken);

        // 로그로 확인해보세요! "sub"에 숫자가 들어있을 겁니다.
        console.log('토큰 해독 결과:', decoded);

        // (2) 팀원이 말한 'subject'가 바로 이 'sub'입니다.
        // 만약 sub가 없으면 userId나 id도 찾아봅니다.
        const userId = decoded.sub || decoded.userId || decoded.id;

        // (3) 기기에 저장 (다른 Service에서 꺼내 쓸 수 있게)
        await AsyncStorage.setItem('accessToken', res.accessToken);
        await AsyncStorage.setItem('userId', String(userId));

        console.log(
            `[로그인 성공] User ID(sub): ${userId} 저장됨`
        );

        setAccessToken(res.accessToken);

        // → RootNavigator에서 AuthStack → AppStack 전환
        onLoginSuccess(res.accessToken);
      }
    } catch (e: any) {
      if (e?.status === 400) {
        Alert.alert('로그인 실패', e.message);
      } else if (e?.status === 401 || e?.status === 403) {
        Alert.alert(
            '로그인 실패',
            '아이디 또는 비밀번호가 올바르지 않습니다.'
        );
      } else {
        Alert.alert('오류', '서버 오류가 발생했습니다.');
      }
    }
  };

  // 회원가입 페이지로 이동
  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  // (임시) 소셜 로그인 핸들러
  const handleGoogleLogin = () => {
    Alert.alert('Google Login', '소셜 로그인은 비활성화 되어 있습니다.');
  };

  const handleKakaoLogin = () => {
    Alert.alert('Kakao Login', '소셜 로그인은 비활성화 되어 있습니다.');
  };

  return (
      <View style={styles.container}>
        <Image
            style={styles.icon}
            source={require('../../components/img/runboo.png')}
            resizeMode="contain"
        />

        <View style={styles.form}>
          {/* 아이디 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>아이디</Text>
            <View style={styles.inlineInputBox}>
              <TextInput
                  style={styles.textInput}
                  placeholder="아이디를 입력하세요"
                  placeholderTextColor="#aaa"
                  value={id}
                  onChangeText={setId}
                  autoCapitalize="none"
              />
            </View>
          </View>

          {/* 비밀번호 */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <View style={styles.inlineInputBox}>
              <TextInput
                  style={styles.textInput}
                  placeholder="비밀번호를 입력하세요"
                  placeholderTextColor="#aaa"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
            <View style={styles.loginButton}>
              <Text style={styles.loginButtonText}>로그인</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 구분선 */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <View style={styles.orTextWrapper}>
            <Text style={styles.orText}>or</Text>
          </View>
          <View style={styles.dividerLine} />
        </View>

        {/* 소셜 로그인 */}
        <View style={styles.socialLoginContainer}>
          <TouchableOpacity
              style={[styles.socialButton, styles.googleButton]}
              onPress={handleGoogleLogin}
          >
            <Image
                style={styles.socialIcon}
                source={require('../../components/img/google.png')}
            />
          </TouchableOpacity>

          <TouchableOpacity
              style={[styles.socialButton, styles.kakaoButton]}
              onPress={handleKakaoLogin}
          >
            <Image
                style={styles.socialIcon}
                source={require('../../components/img/kakao.png')}
            />
          </TouchableOpacity>
        </View>

        {/* 회원가입 */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>계정이 없으신가요?</Text>
          <TouchableOpacity
              onPress={handleSignUp}
              style={styles.signupButton}
          >
            <Text style={styles.signupButtonText}>회원가입</Text>
          </TouchableOpacity>
        </View>
      </View>
  );
};

export default LoginScreen;
