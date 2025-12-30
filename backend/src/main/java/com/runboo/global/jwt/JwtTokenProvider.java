package com.runboo.global.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
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

    public String createAccessToken(Long userId) {
        return createToken(userId, accessTokenValidityMs, "ACCESS");
    }

    public String createRefreshToken(Long userId) {
        return createToken(userId, refreshTokenValidityMs, "REFRESH");
    }

    private String createToken(Long userId, long validityMs, String type) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + validityMs);

        return Jwts.builder()
                .setSubject(String.valueOf(userId))
                .claim("type", type)              // 핵심
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    /* =====================
       Token Validate
    ===================== */

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    /* =====================
       Claims
    ===================== */

    public Long getUserIdFromToken(String token) {
        return Long.valueOf(
                Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody()
                        .getSubject()
        );
    }

    // 토큰 타입 추출
    public String getTokenType(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody()
                .get("type", String.class);
    }
}
