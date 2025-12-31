package com.runboo.domain.course.controller;


import com.runboo.domain.course.dto.CourseDto;
import com.runboo.domain.course.entity.Course;
import com.runboo.domain.course.entity.CourseCategory;
import com.runboo.domain.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public List<CourseDto> getCoursesByCategory(@RequestParam("category") CourseCategory category) {
        return courseService.findCoursesByCategory(category);
    }

    @GetMapping("/{id}")
    public CourseDto getCourseDetail(@PathVariable Long id) {
        return courseService.findCourseDetail(id);
    }

    @GetMapping("/list")
    public List<CourseDto> getCourses(
            @RequestParam double latitude,
            @RequestParam double longitude,
            @RequestParam(defaultValue = "SHORT") String type
    ) {
        return courseService.findCoursesByLocation(latitude, longitude, type);
    }
}
