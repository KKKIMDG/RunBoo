package com.runboo.domain.challenge.controller;

import com.runboo.domain.challenge.dto.UserChallengeDto;
import com.runboo.domain.challenge.service.UserChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user-challenges")
public class UserChallengeController {
    private final UserChallengeService userChallengeService;

    // 특정 유저의 도전과제 목록 조회
    @GetMapping("/{userId}/status/{status}")
    public List<UserChallengeDto> getUserChallenges(@PathVariable Long userId, @PathVariable String status){
        // 서비스에게 유저 ID를 전달하여 가공된 DTO 리스트를 받습니다.
        List<UserChallengeDto> response = userChallengeService.getUserChallengeListByStatus(userId, status);

        // 받은 리스트를 그대로 반환하면 스프링이 알아서 JSON 형태로 변환해준다.
        return response;
    }
}