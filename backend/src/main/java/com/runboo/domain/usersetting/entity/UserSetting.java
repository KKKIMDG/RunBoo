package com.runboo.domain.usersetting.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_setting")
@Getter
@NoArgsConstructor
public class UserSetting {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private boolean pushEnabled = true;

    @Column(nullable = false)
    private boolean voiceGuideEnabled = true;

    @Column(nullable = false, length = 10)
    private String voiceType = "MALE";

    @Column(nullable = false, length = 10)
    private String themeMode = "SYSTEM";

    @Column(nullable = false, length = 10)
    private String fontSize = "SMALL";

    public void updatePushEnabled(Boolean value) {
        if (value != null) this.pushEnabled = value;
    }

    public void updateVoiceGuideEnabled(Boolean value) {
        if (value != null) this.voiceGuideEnabled = value;
    }

    public void updateVoiceType(String value) {
        if (value != null) this.voiceType = value;
    }

    public void updateThemeMode(String value) {
        if (value != null) this.themeMode = value;
    }

    public void updateFontSize(String value) {
        if (value != null) this.fontSize = value;
    }
}
