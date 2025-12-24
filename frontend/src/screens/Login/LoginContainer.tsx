import { Alert } from 'react-native';
import LoginScreen from './LoginScreen';
import { AuthService } from '@/services/auth/authService';
import { setAccessToken } from '@/services/api';

export default function LoginContainer({ navigation }: any) {

    const handleLogin = async (id: string, pw: string) => {
        try {
            const res = await AuthService.login({
                email: id,      // 서버 기준은 email
                password: pw,
            });

            // 토큰 저장
            setAccessToken(res.accessToken);

            // 홈으로 이동
            navigation.replace('Home');
        } catch (e) {
            Alert.alert('로그인 실패', '아이디 또는 비밀번호를 확인하세요.');
        }
    };

    const handleSignUp = () => {
        navigation.navigate('SignUp');
    };

    return (
        <LoginScreen
            onLogin={handleLogin}
            onSignUp={handleSignUp}
        />
    );
}
