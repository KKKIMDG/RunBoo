package com.runboo.domain.challenge.controller;

import com.runboo.domain.challenge.dto.UserChallengeDto;
import com.runboo.domain.challenge.service.UserChallengeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/user-challenges")
public class UserChallengeController {

    private final UserChallengeService userChallengeService;

    // 유저에게 해당하는 진행중인 도전과제 조회
    @GetMapping("/ongoing/{userId}")
    public List<UserChallengeDto> getOngoingChallenges(@PathVariable int userId) {
        return userChallengeService.getOngoingChallenges(userId);
    }
}