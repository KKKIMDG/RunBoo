package com.runboo.global.jwt;

import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
import com.runboo.global.security.CustomUserDetails;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String token = resolveToken(request);

        if (token != null && jwtTokenProvider.validateToken(token)) {
            try {
                // 1. 토큰 타입 확인
                String type = jwtTokenProvider.getTokenType(token);

                // 2. ACCESS 토큰만 인증 처리
                if (!"ACCESS".equals(type)) {
                    filterChain.doFilter(request, response);
                    return;
                }

                // 3. 토큰에서 userId 추출
                Long userId = jwtTokenProvider.getUserIdFromToken(token);

                User user = userRepository.findById(userId).orElseThrow();

                // 4. 권한 (지금은 고정)
                List<SimpleGrantedAuthority> authorities =
                        List.of(new SimpleGrantedAuthority("ROLE_USER"));

                // 5. ★ CustomUserDetails 생성 (핵심)
                CustomUserDetails userDetails =
                        new CustomUserDetails(
                                user.getId(),
                                user.getEmail(),
                                authorities
                        );

                // 6. ★ principal에 userDetails 주입
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );

                authentication.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                SecurityContextHolder.getContext()
                        .setAuthentication(authentication);

            } catch (Exception e) {
                // 토큰 문제면 인증 없이 통과
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");

        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
