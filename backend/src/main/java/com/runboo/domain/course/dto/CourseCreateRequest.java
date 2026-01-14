package com.runboo.domain.course.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class CourseCreateRequest {
    private Long recordId;
    private String name;
    private String description;
    private String address;

    // 👇 이 두 필드가 없어서 0으로 저장되었던 겁니다! 꼭 추가해주세요.
    private Double latitude;
    private Double longitude;
}