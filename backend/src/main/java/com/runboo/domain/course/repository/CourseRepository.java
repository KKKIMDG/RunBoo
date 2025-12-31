package com.runboo.domain.course.repository;

import com.runboo.domain.course.entity.Course;
import com.runboo.domain.course.entity.CourseCategory;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByCourseCategory(CourseCategory courseCategory);

    @Query(value = "SELECT * FROM (" +
            "    SELECT *, " +
            "    (6371 * acos(cos(radians(:userLat)) * cos(radians(latitude)) * " +
            "    cos(radians(longitude) - radians(:userLon)) + " +
            "    sin(radians(:userLat)) * sin(radians(latitude)))) AS distance " +
            "    FROM course" +
            ") AS sub " +
            "WHERE sub.length_km >= :minLen AND sub.length_km < :maxLen " +
            "AND sub.distance <= 10 " +
            "ORDER BY sub.distance ASC",
            nativeQuery = true)
    List<Course> findCoursesByLocationAndLength(
            @Param("userLat") double userLat,
            @Param("userLon") double userLon,
            @Param("minLen") double minLen,
            @Param("maxLen") double maxLen
    );
}
