package com.runboo.domain.user.repository;

import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.enums.SocialProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 이메일 존재 여부 확인
     * - 로컬 회원가입
     * - 이메일 인증
     */
    boolean existsByEmail(String email);

    /**
     * 이메일로 사용자 조회
     * - 로컬 로그인
     * - 소셜 로그인
     */
    Optional<User> findByEmail(String email);

    /**
     * (선택) 이메일 + 소셜 제공자 조회
     * - 같은 이메일로 여러 provider 허용 시 사용
     * - 현재 구조에서는 안 써도 됨
     */
    Optional<User> findByEmailAndSocialProvider(
            String email,
            SocialProvider socialProvider
    );
}
