import { api } from "@/services/api";
import { API_BASE_URL } from "@env";

/**
 * =====================
 * 1단계: 비밀번호 재설정 요청 (기존 그대로)
 * =====================
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
 * 2단계: 인증 코드 검증 (기존 그대로)
 * =====================
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

    return res as VerifyPasswordResetResponse;
}

/**
 * =====================
 * 3단계: 새 비밀번호 설정 (신규)
 * =====================
 * POST /api/auth/password/reset
 * header: Authorization: Bearer {resetToken}
 * body: { newPassword }
 */
export async function resetPassword(
    resetToken: string,
    newPassword: string
): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/auth/password/reset`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${resetToken}`,
        },
        body: JSON.stringify({ newPassword }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw {
            message: body?.message ?? "비밀번호 변경에 실패했습니다.",
        };
    }
}
