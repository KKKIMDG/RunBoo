package com.runboo.domain.course.dto;

import com.runboo.domain.course.entity.Course;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CourseDto {

    private Long id;
    private Long writerId;
    private String name;
    private String description;
    private String address;
    private Double lengthKm;
    private Double latitude;
    private Double longitude;
    private String pathData;
    private String imageUrl;
    private int saveCount;

    public CourseDto(Course course) {
        this.id = course.getId();
        this.writerId = course.getWriterId();
        this.name = course.getName();
        this.description = course.getDescription();
        this.address = course.getAddress();
        this.lengthKm = course.getLengthKm();
        this.latitude = course.getLatitude();
        this.longitude = course.getLongitude();
        this.pathData = course.getPathData();
        this.imageUrl = course.getImageUrl();
        this.saveCount = course.getSaveCount();
    }
}