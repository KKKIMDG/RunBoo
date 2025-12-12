import { LinearGradient } from 'expo-linear-gradient';
import React, { FC, useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from './Component1.styles';

interface Component1Props {
  onLogin?: (id: string, pw: string) => void;
  onSignUp?: () => void;
}

const Component1: FC<Component1Props> = ({ onLogin, onSignUp }) => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  // [API] 일반 로그인 처리 함수
  const handleLogin = async () => {
    // 1. 유효성 검사 (아이디/비번 입력 여부 확인)
    if (!id || !password) {
      Alert.alert('알림', '아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }

    console.log('--- 로그인 요청 시작 ---');
    console.log('입력된 ID:', id);
    // 보안상 비밀번호는 로그에 찍지 않는 것이 좋습니다.

    /* TODO: [백엔드 API 연동] 로그인 요청 보내기
      
      예시 코드 (fetch 사용 시):
      try {
        const response = await fetch('http://YOUR_SERVER_IP:8080/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: id,
            password: password,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // 성공 시 로직
          // 1. 받은 토큰(Access Token)을 기기에 저장 (AsyncStorage 사용 추천)
          // await AsyncStorage.setItem('userToken', data.token);
          
          Alert.alert('성공', '로그인 되었습니다.');
          
          // 2. 메인 화면으로 이동 (부모 컴포넌트에서 처리하거나 여기서 navigation 사용)
          if (onLogin) onLogin(id, password); 
        } else {
          // 실패 시 로직 (비번 틀림, 없는 아이디 등)
          Alert.alert('로그인 실패', data.message || '아이디 또는 비밀번호를 확인하세요.');
        }
      } catch (error) {
        console.error('로그인 에러:', error);
        Alert.alert('오류', '서버 연결에 실패했습니다.');
      }
    */

    // API가 없을 때는 임시로 기존 로직 실행
    if (onLogin) {
      onLogin(id, password);
    } else {
      // 테스트용 알림
      Alert.alert('API 테스트', `서버로 전송 준비 완료\nID: ${id}`);
    }
  };

  // [API] 구글 로그인 처리
  const handleGoogleLogin = () => {
    /*
      TODO: [구글 로그인 연동]
      1. 라이브러리 설치 필요: @react-native-google-signin/google-signin
      2. 구글 클라우드 콘솔에서 OAuth 클라이언트 ID 발급 필요
      3. 로직 순서:
         - Google SDK로 로그인 시도 -> idToken 받기
         - 받은 idToken을 내 백엔드 서버로 전송 (POST /api/auth/google)
         - 백엔드에서 토큰 검증 후 우리 서비스의 JWT 토큰 발급해줌
         - 받은 토큰 저장 후 로그인 완료 처리
    */
    Alert.alert('Google Login', 'API 연동 필요: 구글 SDK를 통해 토큰을 받아 서버로 전송해야 합니다.');
  };

  // [API] 카카오 로그인 처리
  const handleKakaoLogin = () => {
    /*
      TODO: [카카오 로그인 연동]
      1. 라이브러리 설치 필요: @react-native-seoul/kakao-login
      2. Kakao Developers 사이트에서 네이티브 앱 키 발급 및 플랫폼 등록 필요
      3. 로직 순서:
         - Kakao SDK로 로그인 -> AccessToken 받기
         - 받은 토큰을 내 백엔드 서버로 전송 (POST /api/auth/kakao)
         - 백엔드 검증 후 로그인 완료 처리
    */
    Alert.alert('Kakao Login', 'API 연동 필요: 카카오 SDK를 통해 토큰을 받아 서버로 전송해야 합니다.');
  };

  return (
    <View style={styles.container}>
      {/* 1. 메인 로고 (RunBoo) */}
      <Image 
        style={styles.icon} 
        source={require('./img/runboo.png')} 
        resizeMode="contain" 
      />

      {/* 2. 회원가입 영역 */}
      <View style={styles.signupContainer}>
        <Text style={styles.signupText}>계정이 없으신가요?</Text>
        <TouchableOpacity onPress={onSignUp} style={styles.signupButton}>
          <Text style={styles.signupButtonText}>회원가입</Text>
        </TouchableOpacity>
      </View>

      {/* 3. 구분선 (OR) */}
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

      {/* 4. 로그인 폼 */}
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

        {/* 로그인 버튼 클릭 시 handleLogin 실행 */}
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

      {/* 5. 소셜 로그인 버튼들 */}
      <View style={{ gap: 10, alignItems: 'center' }}>
        {/* 구글 로그인 버튼 클릭 시 handleGoogleLogin 실행 */}
        <TouchableOpacity 
          style={[styles.googleButtonBase, styles.googleButtonWhite]}
          onPress={handleGoogleLogin}
        >
          <Image 
            style={styles.googleIcon} 
            source={require('./img/google.png')} 
          />
        </TouchableOpacity>

        {/* 카카오 로그인 버튼 클릭 시 handleKakaoLogin 실행 */}
        <TouchableOpacity 
          style={[styles.googleButtonBase, styles.googleButtonYellow]}
          onPress={handleKakaoLogin}
        >
          <Image 
            style={styles.googleIcon} 
            source={require('./img/kakao.png')} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Component1;