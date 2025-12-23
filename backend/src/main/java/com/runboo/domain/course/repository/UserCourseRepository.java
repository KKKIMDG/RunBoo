package com.runboo.domain.course.repository;

import com.runboo.domain.course.entity.UserCourse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCourseRepository extends JpaRepository<UserCourse, Long> {
    Optional<UserCourse> findByUserIdAndCourseId(Long userId, Long courseId);

    List<UserCourse> findAllByUserId(Long userId);
}
