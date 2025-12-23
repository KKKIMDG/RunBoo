package com.runboo.domain.course.controller;

import com.runboo.domain.course.dto.CourseDto;
import com.runboo.domain.course.dto.UserCourseDto;
import com.runboo.domain.course.service.UserCourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user-courses")
public class UserCourseController {
    private final UserCourseService userCourseService;

    @PostMapping("/toggle")
    public ResponseEntity<UserCourseDto.Response> toggleCourseSave(@RequestBody UserCourseDto.Request request) {
        UserCourseDto.Response response = userCourseService.toggleCourseSave(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<CourseDto>> getSavedCourses(@PathVariable Long userId) {
        List<CourseDto> savedCourses = userCourseService.getSavedCourses(userId);

        return ResponseEntity.ok(savedCourses);
    }
}
