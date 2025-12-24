package com.runboo.domain.auth.service;

import com.runboo.domain.user.dto.GoogleUserResponse;
import com.runboo.domain.user.dto.KakaoUserResponse;
import com.runboo.domain.user.dto.SocialUserInfo;
import com.runboo.domain.user.enums.SocialProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SocialOAuthService {

    // 각 소셜 OAuth 전용 서비스
    // (외부 API 호출 책임은 하위 서비스에 위임)
    private final KakaoOAuthService kakaoOAuthService;
    private final GoogleOAuthService googleOAuthService;

    /**
     * 소셜 타입(provider)에 따라 OAuth 사용자 정보를 조회하고
     * 공통 도메인 모델(SocialUserInfo)로 변환한다.
     * 이 클래스의 책임:
     * - 소셜 타입 분기
     * - 소셜별 응답 DTO → SocialUserInfo 변환
     * 책임 아님:
     * - 회원 가입/로그인 판단
     * - JWT 발급
     */
    public SocialUserInfo getUserInfo(
            SocialProvider provider,
            String accessToken
    ) {
        return switch (provider) {
            case KAKAO -> toSocialUserInfo(
                    kakaoOAuthService.getUserInfo(accessToken)
            );
            case GOOGLE -> toSocialUserInfo(
                    googleOAuthService.getUserInfo(accessToken)
            );
            // LOCAL은 OAuth 대상이 아니므로 여기서 처리하지 않는다
            case LOCAL -> null;
        };
    }

    /**
     * 카카오 사용자 응답 DTO를 공통 SocialUserInfo로 변환한다.
     * - providerId: 카카오에서 제공하는 사용자 고유 ID
     * - nickname: profile 우선, 없으면 properties fallback
     * - email: 동의하지 않은 경우 null 가능
     */
    private SocialUserInfo toSocialUserInfo(KakaoUserResponse body) {

        // 닉네임은 카카오 정책상 필수 동의 항목
        String nickname = body.getKakaoAccount().getProfile().getNickname();

        // 프로필 이미지 URL (필수 동의 항목)
        String profileImageUrl = body.getKakaoAccount().getProfile().getProfileImageUrl();

        // 이메일 (필수 동의 항목)
        String email = body.getKakaoAccount().getEmail();

        return new SocialUserInfo(
                SocialProvider.KAKAO,
                String.valueOf(body.getId()), // 카카오 사용자 고유 ID
                email,
                nickname,
                profileImageUrl
        );
    }

    /**
     * 구글 사용자 응답 DTO를 공통 SocialUserInfo로 변환한다.
     * - providerId: sub (구글 사용자 고유 식별자)
     */
    private SocialUserInfo toSocialUserInfo(GoogleUserResponse body) {
        return new SocialUserInfo(
                SocialProvider.GOOGLE,
                body.getSub(),      // 구글 사용자 고유 ID
                body.getEmail(),
                body.getName(),     // 구글 name을 닉네임으로 사용
                body.getPicture()
        );
    }
}
