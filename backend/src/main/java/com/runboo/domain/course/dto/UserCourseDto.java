package com.runboo.domain.course.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

public class UserCourseDto {

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Request {
        private Long userId;
        private Long courseId;
    }

    @Getter
    @AllArgsConstructor
    public static class Response {
        private String message;
        private Boolean isSaved;
    }
}
