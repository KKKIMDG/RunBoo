package com.runboo.domain.auth.service;

import com.runboo.domain.user.dto.GoogleUserInfo; // DTO 임포트
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class GoogleOAuthService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.client-id}")
    private String clientId;

    @Value("${google.client-secret}")
    private String clientSecret;

    @Value("${google.redirect-uri}")
    private String redirectUri;

    /**
     * 1. 구글 인가 코드를 액세스 토큰으로 교환
     */
    public String getGoogleAccessToken(String code) {
        String tokenUrl = "https://oauth2.googleapis.com/token";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);

        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
        return (String) response.getBody().get("access_token");
    }

    /**
     * 2. 액세스 토큰으로 구글 유저 정보 조회
     * SocialOAuthService에서 요구하는 GoogleUserInfo DTO를 반환하도록 변경
     */
    public GoogleUserInfo getUserInfo(String accessToken) {
        String userInfoUrl = "https://www.googleapis.com/oauth2/v3/userinfo";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Map 대신 GoogleUserInfo.class로 응답을 받음
        ResponseEntity<GoogleUserInfo> response = restTemplate.exchange(
                userInfoUrl,
                HttpMethod.GET,
                entity,
                GoogleUserInfo.class
        );

        return response.getBody();
    }
}