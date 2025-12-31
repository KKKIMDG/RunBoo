package com.runboo.domain.course.service;

import com.runboo.domain.course.dto.CourseDto;
import com.runboo.domain.course.entity.Course;
import com.runboo.domain.course.entity.CourseCategory;
import com.runboo.domain.course.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public List<CourseDto> findCoursesByLocation(double lat, double lon, String type) {
        double minLen = 0;
        double maxLen = 1000;

        // 프론트에서 보낸 타입에 따라 길이 범위 설정
        if ("SHORT".equalsIgnoreCase(type)) { // 5km 미만
            minLen = 0;
            maxLen = 5.0;
        } else if ("LONG".equalsIgnoreCase(type)) { // 5km 이상
            minLen = 5.0;
            maxLen = 1000;
        }

        return courseRepository.findCoursesByLocationAndLength(lat, lon, minLen, maxLen)
                .stream().map(CourseDto::new).collect(Collectors.toList());
    }

    public List<CourseDto> findCoursesByCategory(CourseCategory courseCategory) {
        List<Course> courses = courseRepository.findByCourseCategory(courseCategory);

        List<CourseDto> courseList = new ArrayList<>();

        for (Course course : courses) {
            CourseDto dto = new CourseDto(course);
            dto.setImageUrl(course.getImageUrl());
            courseList.add(dto);
        }

        return courseList;
    }

    public CourseDto findCourseDetail(Long id) {
        Optional<Course> courseBox = courseRepository.findById(id);

        Course course = null;

        if (courseBox.isPresent()) {
            course = courseBox.get();
        } else {
            throw new IllegalArgumentException("해당 코스가 없습니다. id=" + id);
        }

        CourseDto dto = new CourseDto(course);

        dto.setImageUrl(course.getImageUrl());

        return dto;
        }
}
