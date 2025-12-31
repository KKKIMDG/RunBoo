package com.runboo.domain.auth.service;

import com.runboo.domain.user.dto.KakaoUserInfo;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class KakaoOAuthService {

    // 카카오 OAuth API 호출 전용 RestTemplate
    // (소셜 API 호출 책임만 가지며, 도메인 로직은 절대 포함하지 않는다)
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 카카오 AccessToken을 이용해 사용자 정보를 조회한다.
     * 책임:
     * - 카카오 서버와 통신
     * - 카카오 응답(JSON)을 KakaoUserResponse DTO로 역직렬화
     * 책임 아님:
     * - SocialUserInfo 변환
     * - 회원 가입/로그인 판단
     */
    public KakaoUserInfo getUserInfo(String accessToken) {

        // Authorization: Bearer {accessToken} 헤더 구성
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        // 요청 바디는 없고, 헤더만 전달
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // 카카오 사용자 정보 조회 API 호출
        ResponseEntity<KakaoUserInfo> response =
                restTemplate.exchange(
                        "https://kapi.kakao.com/v2/user/me",
                        HttpMethod.GET,
                        entity,
                        KakaoUserInfo.class
                );

        // 응답 DTO 그대로 반환
        // (null 처리 및 공통 모델 변환은 상위 서비스에서 담당)
        return response.getBody();
    }
}
