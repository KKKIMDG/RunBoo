package com.runboo.domain.course.service;

import com.runboo.domain.course.dto.CourseCreateRequest;
import com.runboo.domain.course.dto.CourseDto;
import com.runboo.domain.course.entity.Course;
import com.runboo.domain.course.repository.CourseRepository;
import com.runboo.domain.record.entity.RunRecord;
import com.runboo.domain.record.repository.RunRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class CourseService {

    private final CourseRepository courseRepository;
    private final RunRecordRepository runRecordRepository;

    public List<CourseDto> getCourseList(String sortType, Double lat, Double lon) {
        List<Course> courses;

        if ("NEARBY".equalsIgnoreCase(sortType) && lat != null && lon != null) {
            courses = courseRepository.findNearbyCourses(lat, lon);
        } else if ("LATEST".equalsIgnoreCase(sortType)) {
            courses = courseRepository.findAll(Sort.by(Sort.Direction.DESC, "id")); // id 역순도 최신순과 동일
        } else {
            courses = courseRepository.findAll(Sort.by(Sort.Direction.DESC, "saveCount"));
        }

        return courses.stream()
                .map(CourseDto::new)
                .collect(Collectors.toList());
    }

    public CourseDto findCourseDetail(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 코스가 없습니다. id=" + id));
        return new CourseDto(course);
    }

    @Transactional
    public void createCourse(Long userId, CourseDto request) {
        Course course = new Course(
                userId,
                request.getName(),
                request.getDescription(),
                request.getAddress(),
                request.getLengthKm(),
                request.getLatitude(),
                request.getLongitude(),
                request.getPathData(),
                request.getImageUrl()
        );
        courseRepository.save(course);
    }
    @Transactional
    public void createCourseFromRecord(Long userId, CourseCreateRequest request) {
        RunRecord record = runRecordRepository.findById(request.getRecordId())
                .orElseThrow(() -> new IllegalArgumentException("기록이 없습니다."));

        if (!record.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 기록만 등록 가능합니다.");
        }

        Course course = new Course(
                userId,
                request.getName(),
                request.getDescription(),
                request.getAddress(),
                record.getDistanceM() / 1000.0, // m -> km
                request.getLatitude(),
                request.getLongitude(),
                record.getRoutePolyLine(), // 경로 데이터
                null // 이미지
        );

        courseRepository.save(course);
    }
    public List<CourseDto> getMyCourseList(Long userId) {
        return courseRepository.findAllByWriterIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(CourseDto::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteCourse(Long userId, Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코스입니다."));

        if (!course.getWriterId().equals(userId)) {
            throw new IllegalArgumentException("본인이 작성한 코스만 삭제할 수 있습니다.");
        }

        courseRepository.delete(course);
    }
}