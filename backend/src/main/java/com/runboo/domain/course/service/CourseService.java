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

@RequiredArgsConstructor
@Service
public class CourseService {

    private final CourseRepository courseRepository;

    public List<CourseDto> findCoursesByCategory(CourseCategory courseCategory) {
        List<Course> courses = courseRepository.findByCourseCategory(courseCategory);

        List<CourseDto> courseList = new ArrayList<>();

        for (Course course : courses) {
            CourseDto dto = new CourseDto(course);
            courseList.add(dto);
        }

        return courseList;
    }

    public CourseDto findCourseDetail(Long id) {
        Optional<Course> courseBox = courseRepository.findById(id);

        if (courseBox.isPresent()) {
            return new CourseDto(courseBox.get());
        } else {
            throw new IllegalArgumentException("해당 코스가 존재하지 않습니다. id=" + id);
        }
    }
}
