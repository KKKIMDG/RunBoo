package com.runboo.global.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private final Key key;
    private final long accessTokenValidityMs;
    private final long refreshTokenValidityMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration-minutes}") long accessMinutes,
            @Value("${jwt.refresh-token-expiration-days}") long refreshDays
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenValidityMs = accessMinutes * 60 * 1000;
        this.refreshTokenValidityMs = refreshDays * 24 * 60 * 60 * 1000;
    }

    /* =====================
       Token Create
    ===================== */

    /**
     * access token 생성
     */
    public String createAccessToken(Long userId) {
        return createToken(String.valueOf(userId), accessTokenValidityMs, "ACCESS");
    }

    /**
     * refresh token 생성
     */
    public String createRefreshToken(Long userId) {
        return createToken(String.valueOf(userId), refreshTokenValidityMs, "REFRESH");
    }

    /**
     * 공통 토큰 생성 로직
     */
    private String createToken(String subject, long validityMs, String type) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityMs);

        return Jwts.builder()
                .setSubject(subject)
                .claim("type", type) // 토큰 용도 명시
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * 비밀번호 재설정 전용 토큰 생성
     *
     * 특징
     * - 이메일 기반 (userId 사용 X)
     * - type = PASSWORD_RESET
     * - 짧은 만료 시간 (10분)
     */
    public String createPasswordResetToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("type", "PASSWORD_RESET")
                .setIssuedAt(new Date())
                .setExpiration(
                        Date.from(Instant.now().plusSeconds(10 * 60))
                )
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /* =====================
       Token Validate
    ===================== */

    /**
     * 토큰 서명 + 만료 검증
     */
    public boolean validateToken(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /* =====================
       Claims
    ===================== */

    /**
     * 토큰에서 userId 추출 (access / refresh 전용)
     */
    public Long getUserIdFromToken(String token) {
        return Long.valueOf(parseClaims(token).getSubject());
    }

    /**
     * 토큰 타입 추출
     */
    public String getTokenType(String token) {
        return parseClaims(token).get("type", String.class);
    }

    /**
     * 비밀번호 재설정 토큰 검증 및 이메일 추출
     *
     * 검증 포인트
     * - 토큰 타입이 PASSWORD_RESET인지
     */
    public String getEmailFromPasswordResetToken(String token) {
        Claims claims = parseClaims(token);

        if (!"PASSWORD_RESET".equals(claims.get("type"))) {
            throw new JwtException("Invalid password reset token");
        }

        return claims.getSubject(); // email
    }

    /**
     * Claims 파싱 공통 메서드
     */
    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
