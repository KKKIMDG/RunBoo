package com.runboo.domain.auth.service;

import com.runboo.domain.user.dto.GoogleUserInfo;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class GoogleOAuthService {

    // 구글 OAuth 사용자 정보 API 호출 전용 RestTemplate
    // (외부 OAuth 통신만 담당하며, 도메인 로직은 포함하지 않는다)
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Google AccessToken을 이용해 사용자 정보를 조회한다.
     * 책임:
     * - 구글 OAuth 서버와 통신
     * - 응답(JSON)을 GoogleUserResponse DTO로 역직렬화
     * 책임 아님:
     * - SocialUserInfo 변환
     * - 회원 가입/로그인 판단
     */
    public GoogleUserInfo getUserInfo(String accessToken) {

        // Authorization: Bearer {accessToken} 헤더 구성
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        // 요청 바디 없이 헤더만 전달
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // 구글 사용자 정보 조회 API 호출
        ResponseEntity<GoogleUserInfo> response =
                restTemplate.exchange(
                        "https://www.googleapis.com/oauth2/v3/userinfo",
                        HttpMethod.GET,
                        entity,
                        GoogleUserInfo.class
                );

        // 응답 DTO 그대로 반환
        // (null 처리 및 공통 모델 변환은 상위 서비스에서 담당)
        return response.getBody();
    }
}
