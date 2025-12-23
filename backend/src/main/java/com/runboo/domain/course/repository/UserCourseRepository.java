package com.runboo.domain.course.repository;

import com.runboo.domain.course.entity.UserCourse;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserCourseRepository extends JpaRepository<UserCourse, Long> {
    boolean findByUserIdAndCourseId(Long userId, Long courseId);


}
