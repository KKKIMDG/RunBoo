import { LinearGradient } from 'expo-linear-gradient';
import React, { FC, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from './LoginScreen.styles';

interface LoginScreenProps {
  onLogin?: (id: string, pw: string) => void;
  onSignUp?: () => void;
}

const LoginScreen: FC<LoginScreenProps> = ({ onLogin, onSignUp }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!id || !password) {
      Alert.alert('알림', '아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    // 임시 동작: 부모 컴포넌트의 onLogin 호출
    if (onLogin) {
      onLogin(id, password);
    } else {
      Alert.alert('API 테스트', `서버로 전송 준비 완료\nID: ${id}`);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert('Google Login', 'API 연동 필요: 구글 SDK를 통해 토큰을 받아 서버로 전송해야 합니다.');
  };

  const handleKakaoLogin = () => {
    Alert.alert('Kakao Login', 'API 연동 필요: 카카오 SDK를 통해 토큰을 받아 서버로 전송해야 합니다.');
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.icon}
        source={require('../components/img/runboo.png')}
        resizeMode="contain"
      />

      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>계정이 없으신가요?</Text>
        <TouchableOpacity onPress={onSignUp} style={styles.signupButton}>
          <Text style={styles.signupButtonText}>회원가입</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dividerContainer}>
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(14,165,233,0.3)', 'rgba(0,0,0,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.dividerLine}
        />
        <View style={styles.orTextWrapper}>
          <Text style={styles.orText}>or</Text>
        </View>
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(251,191,36,0.3)', 'rgba(0,0,0,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.dividerLine}
        />
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>아이디</Text>
          <View style={styles.inputBox}>
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

        <View style={styles.inputGroup}>
          <Text style={styles.label}>비밀번호</Text>
          <View style={styles.inputBox}>
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
            <LinearGradient
              colors={['#000000ff', '#000000ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[StyleSheet.absoluteFill, { borderRadius: 8 }]}
            />
            <Text style={styles.loginButtonText}>로그인</Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={{ gap: 10, alignItems: 'center' }}>
        <TouchableOpacity
          style={[styles.googleButtonBase, styles.googleButtonWhite]}
          onPress={handleGoogleLogin}
        >
          <Image style={styles.googleIcon} source={require('../components/img/google.png')} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.googleButtonBase, styles.googleButtonYellow]}
          onPress={handleKakaoLogin}
        >
          <Image style={styles.googleIcon} source={require('../components/img/kakao.png')} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginScreen;
