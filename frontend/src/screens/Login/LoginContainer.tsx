import { Alert } from 'react-native';
import LoginScreen from './LoginScreen';
import { AuthService } from '@/services/auth/authService';
import { setAccessToken } from '@/services/api';

// ★ 1. 추가된 임포트 (토큰 해독기 & 저장소)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

export default function LoginContainer({ navigation, onLoginSuccess }: any) {

    //로그인 처리(페이지 이동, 에러알람처리)
    const handleLogin = async (id: string, pw: string) => {
        try {
            const res = await AuthService.login({
                email: id,
                password: pw,
            });

            // ★ 2. 여기서 토큰을 뜯어서 ID를 저장합니다!
            if (res.accessToken) {
                // (1) 토큰 해독
                const decoded: any = jwtDecode(res.accessToken);

                // 로그로 확인해보세요! "sub"에 숫자가 들어있을 겁니다.
                console.log("토큰 해독 결과:", decoded);

                // (2) 팀원이 말한 'subject'가 바로 이 'sub'입니다.
                // 만약 sub가 없으면 userId나 id도 찾아봅니다.
                const userId = decoded.sub || decoded.userId || decoded.id;

                // (3) 기기에 저장 (CourseService에서 꺼내 쓸 수 있게)
                await AsyncStorage.setItem('accessToken', res.accessToken);
                await AsyncStorage.setItem('userId', String(userId));

                console.log(`[로그인 성공] User ID(sub): ${userId} 저장됨`);

                setAccessToken(res.accessToken);
                // → RootNavigator에서 AuthStack → AppStack 전환
                onLoginSuccess(res.accessToken);
            }

        } catch (e: any) {
            if (e?.status === 400) {
                Alert.alert('로그인 실패', e.message);
            } else if (e?.status === 401 || e?.status === 403) {
                Alert.alert('로그인 실패', '아이디 또는 비밀번호가 올바르지 않습니다.');
            } else {
                Alert.alert('오류', '서버 오류가 발생했습니다.');
            }
        }
    };
    //회원가입 페이지로 이동
    const handleSignUp = () => {
        navigation.navigate('SignUp');
    };

    return <LoginScreen
        onLogin={handleLogin}
        onSignUp={handleSignUp}
    />;
}
