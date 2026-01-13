package com.runboo.domain.course.service;

import com.runboo.domain.course.dto.CourseDto;
import com.runboo.domain.course.dto.UserCourseDto;
import com.runboo.domain.course.entity.Course;
import com.runboo.domain.course.entity.UserCourse;
import com.runboo.domain.course.repository.CourseRepository;
import com.runboo.domain.course.repository.UserCourseRepository;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserCourseService {

    private final UserCourseRepository userCourseRepository;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;

    public UserCourseDto.Response toggleCourseSave(Long userId, UserCourseDto.Request request) {
        Long courseId = request.getCourseId();

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 코스입니다. id=" + courseId));

        Optional<UserCourse> userCourseBox =
                userCourseRepository.findByUserIdAndCourseId(userId, courseId);

        if (userCourseBox.isPresent()) {
            userCourseRepository.delete(userCourseBox.get());

            course.decreaseSaveCount();

            return new UserCourseDto.Response("저장 취소", false);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("존재하지 않는 회원입니다. id=" + userId)
                );

        UserCourse userCourse = new UserCourse(user, course);
        userCourseRepository.save(userCourse);

        course.increaseSaveCount();

        return new UserCourseDto.Response("저장 성공", true);
    }

    @Transactional(readOnly = true)
    public List<CourseDto> getSavedCourses(Long userId) {
        List<UserCourse> userCourses =
                userCourseRepository.findAllByUserId(userId);

        List<CourseDto> responseList = new ArrayList<>();

        for (UserCourse userCourse : userCourses) {
            responseList.add(new CourseDto(userCourse.getCourse()));
        }

        return responseList;
    }
}