package com.runboo.domain.course.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long id;

    private String name;

    private String address;

    @Column(name = "length_km")
    private Double lengthKm;

    private Double latitude;

    private Double longitude;

    @Enumerated(EnumType.STRING)
    @Column(name = "category")
    private CourseCategory courseCategory;

    @Column(name = "image_url")
    private String imageUrl;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<UserCourse> userCourses = new ArrayList<>();
}
