// Login.styles.ts
// - 스타일 정의: 레이아웃, 입력창, 버튼, 소셜아이콘 등.
// - 필요 시 theme/토큰으로 추상화하세요.
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    width: 160,
    height: 160,
    marginBottom: 30,
  },
  form: {
    width: '100%',
    maxWidth: 320,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  inputBox: {
    height: 53,
    width: '100%',
    position: 'relative',
  },
  textInput: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    backgroundColor: '#fff',
    borderWidth: 0.6,
    borderColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  loginButton: {
    height: 52,
    borderRadius: 15,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 5,
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 0.55,
    textTransform: 'uppercase',
  },
  dividerContainer: {
    width: '100%',
    maxWidth: 320,
    height: 19,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginVertical: 20,
  },
  dividerLine: {
    height: 1,
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  orTextWrapper: {
    alignItems: 'center',
  },
  orText: {
    fontSize: 12,
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  socialLoginContainer: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
    maxWidth: 320,
  },
  socialButton: {
    flex: 1,
    height: 46,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.17,
    shadowRadius: 3,
    elevation: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  kakaoButton: {
    backgroundColor: '#fee100',
  },
  socialIcon: {
    width: 23,
    height: 23,
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  signupText: {
    fontSize: 14,
    color: '#6b7280',
    letterSpacing: -0.15,
    marginRight: 8,
  },
  signupButton: {},
  signupButtonText: {
    fontSize: 14,
    color: '#3a4a98',
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
});
