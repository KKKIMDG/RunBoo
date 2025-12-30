
import {useRef, useState} from 'react';
import { Alert } from 'react-native';
import { AuthService } from '@/services/auth/authService';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

// AuthStack의 네비게이션 파라미터 타입을 정의합니다.
// 실제 프로젝트의 네비게이션 스택에 맞게 수정해야 합니다.
type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

type NavigationProp = StackNavigationProp<AuthStackParamList, 'Signup'>;

export const useSignupForm = () => {
    const navigation = useNavigation<NavigationProp>();

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordCheck, setPasswordCheck] = useState('');
    const [nickname, setNickname] = useState('');
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0); // 인증코드 유효시간
    const [isCodeSent, setIsCodeSent] = useState(false); // 인증코드 입력칸 표시 여부
    const [canResend, setCanResend] = useState(true); // 재발송 쿨타임
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isCodeExpired, setIsCodeExpired] = useState(false);

    const isValidEmail = (value: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    };

    const handleSendCode = async () => {
        if (!email) {
            Alert.alert('오류', '이메일을 입력하세요');
            return;
        }
        if (!isValidEmail(email)) {
            Alert.alert('오류', '이메일 형식이 올바르지 않습니다');
            return;
        }

        try {
            // 1. 서버 요청
            await AuthService.sendEmailCode(email);

            // 2. 성공했을 때 UI 변경
            setIsCodeSent(true);
            setCanResend(false);
            setTimeLeft(300);
            setIsCodeExpired(false);

            Alert.alert('성공', '인증 코드가 전송되었습니다.');

            // 타이머 시작
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timerRef.current!);
                        timerRef.current = null;
                        setIsCodeExpired(true);
                        Alert.alert(
                            '인증 만료',
                            '인증 시간이 만료되었습니다. 다시 인증해주세요.'
                        );
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            // 재발송 쿨타임
            setTimeout(() => {
                setCanResend(true);
            }, 5000);

        } catch (error: any) {
            // 3. api.ts 구조에 맞게 message 사용
            Alert.alert(
                '실패',
                error?.message ?? '인증 코드 전송 실패'
            );
        }
    };



    const formatTime = (seconds: number) => {
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const handleVerifyCode = async () => {
        if (code.length !== 6) {
            Alert.alert('오류', '인증 코드는 6자리입니다');
            return;
        }
        try {
            await AuthService.verifyEmailCode(email, code);
            Alert.alert('완료', '이메일 인증이 완료되었습니다.');
            setIsEmailVerified(true);
        } catch (error: any) {
            Alert.alert('실패', error?.message ?? '인증 코드가 올바르지 않습니다.');
        }
    };

    const handleSignUp = async () => {
        if (!isEmailVerified) {
            Alert.alert('오류', '이메일 인증을 먼저 완료해주세요.');
            return;
        }
        if (!password || password !== passwordCheck) {
            Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
            return;
        }
        if (!nickname) {
            Alert.alert('오류', '닉네임을 입력하세요.');
            return;
        }
        try {
            await AuthService.signup({ email, password, nickname });
            Alert.alert('축하합니다!', '회원가입이 완료되었습니다.', [
                { text: '확인', onPress: () => navigation.navigate('Login') },
            ]);
        } catch (error: any) {
            Alert.alert('회원가입 실패', error?.message ?? '다시 시도해주세요.');
        }
    };

    return {
        formState: {
            email,
            code,
            password,
            passwordCheck,
            nickname,
            isCodeSent,
            isEmailVerified,
            timeLeft,
            isCodeExpired,
            canResend,
        },
        formHandlers: {
            setEmail,
            setCode,
            setPassword,
            setPasswordCheck,
            setNickname,
        },
        apiHandlers: {
            handleSendCode,
            handleVerifyCode,
            handleSignUp,
            formatTime,
        },
    };
};
