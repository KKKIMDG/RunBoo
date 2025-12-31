package com.runboo.domain.user.service;

import com.runboo.domain.user.dto.PasswordChangeRequestDto;
import com.runboo.domain.user.dto.UserProfileUpdateRequestDto;
import com.runboo.domain.user.dto.UserMeResponseDto;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
import com.runboo.global.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    //내 정보 조회
    @Transactional(readOnly = true)
    public UserMeResponseDto getMyInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저를 찾을 수 없습니다. userId=" + userId));

        return UserMeResponseDto.from(user);

//    //내 정보 업데이트(프로필 수정)
//    @Transactional
//    public void updateProfile(UserProfileUpdateRequestDto request) {
//
//    }
//
//    //비밀번호 변경
//    @Transactional
//    public void changePassword(PasswordChangeRequestDto request) {
//
//    }
//
//    //계정 탈퇴
//    @Transactional
//    public void withdraw() {
//
   }
}
