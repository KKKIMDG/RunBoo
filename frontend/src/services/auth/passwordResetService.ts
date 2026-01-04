import { api } from "@/services/api";

/**
 * =====================
 * 1단계: 비밀번호 재설정 요청
 * =====================
 * POST /api/auth/password/reset-request
 * body: { email }
 * response: 없음 (200 OK)
 */
type PasswordResetRequestBody = {
    email: string;
};

export async function requestPasswordReset(email: string): Promise<void> {
    await api.post<PasswordResetRequestBody>(
        "/api/auth/password/reset-request",
        { email }
    );
}

/**
 * =====================
 * 2단계: 인증 코드 검증
 * =====================
 * POST /api/auth/password/verify
 * body: { email, code }
 * response: { resetToken }
 */
type VerifyPasswordResetBody = {
    email: string;
    code: string;
};

type VerifyPasswordResetResponse = {
    resetToken: string;
};

export async function verifyPasswordResetCode(
    email: string,
    code: string
): Promise<VerifyPasswordResetResponse> {
    const res = await api.post<VerifyPasswordResetBody>(
        "/api/auth/password/verify",
        { email, code }
    );

    // api.post는 handleResponse 결과(any)를 그대로 반환함
    return res as VerifyPasswordResetResponse;
}
