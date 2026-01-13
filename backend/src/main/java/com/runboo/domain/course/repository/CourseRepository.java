package com.runboo.domain.course.repository;

import com.runboo.domain.course.entity.Course;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findAll(Sort sort);

    @Query(value = "SELECT * FROM (" +
            "    SELECT *, " +
            "    (6371 * acos(cos(radians(:userLat)) * cos(radians(latitude)) * " +
            "    cos(radians(longitude) - radians(:userLon)) + " +
            "    sin(radians(:userLat)) * sin(radians(latitude)))) AS distance " +
            "    FROM course" +
            ") AS sub " +
            "WHERE sub.distance <= 10 " +
            "ORDER BY sub.distance ASC",
            nativeQuery = true)
    List<Course> findNearbyCourses(
            @Param("userLat") double userLat,
            @Param("userLon") double userLon
    );
    List<Course> findAllByWriterIdOrderByCreatedAtDesc(Long writerId);
}