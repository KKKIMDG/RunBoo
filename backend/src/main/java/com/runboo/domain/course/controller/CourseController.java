package com.runboo.domain.course.controller;

import com.runboo.domain.course.dto.CourseCreateRequest;
import com.runboo.domain.course.dto.CourseDto;
import com.runboo.domain.course.service.CourseService;
import com.runboo.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @PostMapping
    public void createCourse(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody CourseDto request
    ) {
        courseService.createCourse(user.getUserId(), request);
    }

    @GetMapping("/list")
    public List<CourseDto> getCourses(
            @RequestParam(defaultValue = "POPULAR") String sort,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude
    ) {
        return courseService.getCourseList(sort, latitude, longitude);
    }

    @GetMapping("/{id}")
    public CourseDto getCourseDetail(@PathVariable Long id) {
        return courseService.findCourseDetail(id);
    }

    @PostMapping("/from-record")
    public ResponseEntity<String> createCourseFromRecord(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody CourseCreateRequest request
    ) {
        courseService.createCourseFromRecord(user.getUserId(), request);
        return ResponseEntity.ok("코스가 성공적으로 등록되었습니다.");
    }

    @GetMapping("/my")
    public List<CourseDto> getMyCourses(@AuthenticationPrincipal CustomUserDetails user) {
        return courseService.getMyCourseList(user.getUserId());
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<String> deleteCourse(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long courseId
    ) {
        courseService.deleteCourse(user.getUserId(), courseId);
        return ResponseEntity.ok("코스가 삭제되었습니다.");
    }
}