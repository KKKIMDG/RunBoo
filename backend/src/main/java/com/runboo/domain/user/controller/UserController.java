package com.runboo.domain.user.controller;

import com.runboo.domain.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

//    private final UserService userService;
//
//    /**
//     * 내 정보 조회
//     * GET /api/users/me
//     */
//    @GetMapping("/me")
//    public ResponseEntity<UserMeResponseDto> getMyInfo() {
//        UserMeResponseDto response = userService.getMyInfo();
//        return ResponseEntity.ok(response);
//    }
//
//    /**
//     * 프로필 수정
//     * PUT /api/users/me
//     */
//    @PutMapping("/me")
//    public ResponseEntity<Void> updateProfile(
//            @RequestBody UserProfileUpdateRequestDto request
//    ) {
//        userService.updateProfile(request);
//        return ResponseEntity.ok().build();
//    }
//
//    /**
//     * 비밀번호 변경
//     * PUT /api/users/password
//     */
//    @PutMapping("/password")
//    public ResponseEntity<Void> changePassword(
//            @RequestBody PasswordChangeRequestDto request
//    ) {
//        userService.changePassword(request);
//        return ResponseEntity.ok().build();
//    }
//
//    /**
//     * 계정 탈퇴
//     * DELETE /api/users/me
//     */
//    @DeleteMapping("/me")
//    public ResponseEntity<Void> withdraw() {
//        userService.withdraw();
//        return ResponseEntity.ok().build();
//    }
}
