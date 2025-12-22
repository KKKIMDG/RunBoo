package com.runboo.domain.course.repository;

import com.runboo.domain.course.entity.Course;
import com.runboo.domain.course.entity.CourseCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByCourseCategory(CourseCategory courseCategory);

}
