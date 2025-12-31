package com.runboo.domain.course.controller;

import com.runboo.domain.course.dto.CourseDto;
import com.runboo.domain.course.dto.UserCourseDto;
import com.runboo.domain.course.service.UserCourseService;
import com.runboo.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user-courses")
public class UserCourseController {
    private final UserCourseService userCourseService;
    /**
     * 코스 찜 / 해제
     */
    @PostMapping("/toggle")
    public ResponseEntity<UserCourseDto.Response> toggleCourseSave(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody UserCourseDto.Request request
    ) {
        UserCourseDto.Response response =
                userCourseService.toggleCourseSave(user.getUserId(),request);

        return ResponseEntity.ok(response);
    }

    /**
     * 내가 찜한 코스 목록 조회
     */
    @GetMapping
    public ResponseEntity<List<CourseDto>> getSavedCourses(@AuthenticationPrincipal CustomUserDetails user) {
        List<CourseDto> savedCourses = userCourseService.getSavedCourses(user.getUserId());

        return ResponseEntity.ok(savedCourses);
    }
}
