package com.runboo.domain.course.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(name = "course")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    private Long id;

    @Column(name = "writer_id", nullable = false)
    private Long writerId;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String address;

    @Column(name = "length_km", nullable = false)
    private Double lengthKm;

    private Double latitude;
    private Double longitude;

    @Column(name = "path_data", columnDefinition = "TEXT")
    private String pathData;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "save_count", nullable = false)
    @ColumnDefault("0")
    private int saveCount = 0;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    private List<UserCourse> userCourses = new ArrayList<>();

    public Course(Long writerId, String name, String description, String address,
                  Double lengthKm, Double latitude, Double longitude,
                  String pathData, String imageUrl) {
        this.writerId = writerId;
        this.name = name;
        this.description = description;
        this.address = address;
        this.lengthKm = lengthKm;
        this.latitude = latitude;
        this.longitude = longitude;
        this.pathData = pathData;
        this.imageUrl = imageUrl;
        this.saveCount = 0; // 초기값 0
    }

    public void increaseSaveCount() {
        this.saveCount++;
    }

    public void decreaseSaveCount() {
        if (this.saveCount > 0) {
            this.saveCount--;
        }
    }
}