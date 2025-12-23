package com.runboo.domain.user.entity;


import com.runboo.domain.course.entity.UserCourse;
import com.runboo.domain.record.entity.RunRecord;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Cleanup;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@EntityListeners(AuditingEntityListener.class)
@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    private String email;

    private String password;

    @Column(name = "nickname")
    private String nickName;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "state")
    private UserState userState;

    @Column(name = "delete_at")
    private OffsetDateTime deleteAt;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserCourse> userCourses = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RunRecord> runRecords = new ArrayList<>();

}
