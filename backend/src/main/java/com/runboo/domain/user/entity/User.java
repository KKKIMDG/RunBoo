package com.runboo.domain.user.entity;


import com.runboo.domain.course.entity.UserCourse;
import com.runboo.domain.record.entity.RunRecord;
import com.runboo.domain.user.enums.SocialProvider;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Cleanup;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
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
    private String nickname;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "state")
    private UserState userState;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "is_blind", nullable = false, columnDefinition = "boolean default false")
    private boolean isBlind = false;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<UserCourse> userCourses = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RunRecord> runRecords = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private SocialProvider socialProvider;

    public static User createLocal(String email, String encodedPassword, String nickname) {
        User user = new User();
        user.email = email;
        user.password = encodedPassword;
        user.nickname = nickname;
        user.socialProvider = SocialProvider.LOCAL;
        user.userState = UserState.ACTIVATION;
        return user;
    }

    public static User createSocial(String email, SocialProvider provider, String nickname) {
        User user = new User();
        user.email = email;
        user.nickname = nickname;
        user.socialProvider = provider;
        user.userState = UserState.ACTIVATION;
        return user;
    }

    public boolean isSocialUser() {
        return this.socialProvider != SocialProvider.LOCAL;
    }

    public void changeNickname(String nickname) {
        this.nickname = nickname;
    }

    public void changeProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }
    public void changePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
    public void changeBlindStatus(boolean isBlind) {
        this.isBlind = isBlind;
    }

    public void withdraw() {
        if (this.userState == UserState.DELETED) return;

        this.userState = UserState.DELETED;
        this.deletedAt = LocalDateTime.now();
    }

}
