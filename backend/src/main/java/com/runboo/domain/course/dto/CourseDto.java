package com.runboo.domain.course.dto;

import com.runboo.domain.course.entity.Course;
import com.runboo.domain.course.entity.CourseCategory;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CourseDto {

    private Long id;
    private String name;
    private String address;
    private Double lengthKm;
    private Double latitude;
    private Double longitude;
    private CourseCategory category;
    private String imageUrl;

    public CourseDto(Course course) {
        this.id = course.getId();
        this.name = course.getName();
        this.address = course.getAddress();
        this.lengthKm = course.getLengthKm();
        this.latitude = course.getLatitude();
        this.longitude = course.getLongitude();
        this.category = course.getCourseCategory();
        this.imageUrl = course.getImageUrl();
    }
}