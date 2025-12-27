
import { useState } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthService } from '@/services/auth/authService';
import { setAccessToken } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import { StackNavigationProp } from '@react-navigation/stack';

// 네비게이션 스택 파라미터 타입 정의
type AuthStackParamList = {
    SignUp: undefined;
};

type NavigationProp = StackNavigationProp<AuthStackParamList>;

export const useLoginForm = (onLoginSuccess: (token: string) => void) => {
    const navigation = useNavigation<NavigationProp>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('알림', '아이디와 비밀번호를 모두 입력해주세요.');
            return;
        }

        try {
            const res = await AuthService.login({ email, password });

            if (res.accessToken) {
                const decoded: any = jwtDecode(res.accessToken);
                const userId = decoded.sub || decoded.userId || decoded.id;

                await AsyncStorage.setItem('accessToken', res.accessToken);
                await AsyncStorage.setItem('userId', String(userId));

                console.log(`[로그인 성공] User ID(sub): ${userId} 저장됨`);

                setAccessToken(res.accessToken);
                onLoginSuccess(res.accessToken);
            }
        } catch (e: any) {
            // 에러 처리 로직은 기존과 동일하게 유지
            if (e?.status === 400) {
                Alert.alert('로그인 실패', e.message);
            } else if (e?.status === 401 || e?.status === 403) {
                Alert.alert('로그인 실패', '아이디 또는 비밀번호가 올바르지 않습니다.');
            } else {
                Alert.alert('오류', '서버 오류가 발생했습니다.');
            }
        }
    };

    const handleSignUp = () => {
        navigation.navigate('SignUp');
    };

    const handleSocialLogin = (platform: 'Google' | 'Kakao') => {
        Alert.alert(`${platform} Login`, '소셜 로그인은 비활성화 되어 있습니다.');
    };

    return {
        formState: { email, password },
        formHandlers: { setEmail, setPassword },
        apiHandlers: { handleLogin },
        navigationHandlers: { handleSignUp, handleSocialLogin },
    };
};
