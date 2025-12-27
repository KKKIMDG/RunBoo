import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

export const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: Colors[scheme].background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    icon: {
        width: 140, // 회원가입 시에는 입력창이 많으므로 아이콘 크기를 살짝 줄임
        height: 140,
        marginBottom: 20,
    },
    form: {
        width: '100%',
        maxWidth: 320,
        gap: 12, // 입력 필드 간 간격 조정
    },
    inputGroup: {
        gap: 6,
    },
    label: {
        fontSize: 12,
        color: Colors[scheme].icon,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginLeft: 4,
    },
    // 일반 입력창 컨테이너
    inputBox: {
        height: 53,
        width: '100%',
    },
    // 이메일/인증코드 전용 컨테이너 (버튼 포함)
    inlineInputBox: {
        height: 53,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 15,
        backgroundColor: Colors[scheme].card,
        borderWidth: 0.6,
        borderColor: Colors[scheme].secondaryBackground,
        paddingRight: 10,
        overflow: 'hidden',
    },
    // 공통 텍스트 입력 스타일 (테두리 없음, 인라인용)
    textInput: {
        flex: 1,
        height: '100%',
        paddingHorizontal: 16,
        fontSize: 16,
        color: Colors[scheme].text,
    },
    // 일반 텍스트 입력 스타일 (테두리 있음, 단독용)
    textInputBox: {
        flex: 1,
        height: '100%',
        borderRadius: 15,
        backgroundColor: Colors[scheme].card,
        borderWidth: 0.6,
        borderColor: Colors[scheme].secondaryBackground,
        paddingHorizontal: 16,
        fontSize: 16,
        color: Colors[scheme].text,
    },
    // 인라인 버튼 (인증, 확인 등)
    inlineButton: {
        height: 36,
        paddingHorizontal: 14,
        borderRadius: 10,
        backgroundColor: Colors[scheme].text,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
        zIndex: 10,
    },
    inlineButtonText: {
        color: Colors[scheme].background,
        fontSize: 14,
        fontWeight: '700',
    },
    // 하단 메인 가입 버튼
    submitButton: {
        height: 55,
        borderRadius: 15,
        backgroundColor: Colors[scheme].primary, // 회원가입은 로그인과 차별화된 포인트 컬러 권장
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 15,
        shadowColor: Colors[scheme].primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    submitButtonText: {
        color: Colors[scheme].background,
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
});