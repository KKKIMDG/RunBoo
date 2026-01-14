package com.runboo.domain.user.repository;

import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.enums.SocialProvider;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
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

    @Query("select u.id from User u where u.userState = com.runboo.domain.user.entity.UserState.ACTIVATION")
    List<Long> findAllActiveUserIds();

    @Query("SELECT u FROM User u WHERE (u.email LIKE %:keyword% OR u.nickname LIKE %:keyword%) AND u.id != :myId")
    List<User> searchUsers(@Param("keyword") String keyword, @Param("myId") Long myId);


}
