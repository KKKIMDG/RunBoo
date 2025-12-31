package com.runboo.global.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

public class SecurityUtil {

    private SecurityUtil() {
        // 유틸 클래스 인스턴스화 방지
    }

    /**
     * 현재 로그인한 사용자 ID 조회
     * - JWT 인증 기반
     * - 내 데이터 API에서만 사용
     */
    public static Long getCurrentUserId() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalStateException("인증 정보가 없습니다.");
        }

        Object principal = authentication.getPrincipal();

        // JWT 인증에서 custom UserDetails를 사용하는 경우
        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getUserId();
        }

        // 기본 UserDetails (혹시 모를 fallback)
        if (principal instanceof UserDetails userDetails) {
            return Long.parseLong(userDetails.getUsername());
        }

        // 그 외는 모두 비정상
        throw new IllegalStateException("사용자 정보를 가져올 수 없습니다.");
    }
}
