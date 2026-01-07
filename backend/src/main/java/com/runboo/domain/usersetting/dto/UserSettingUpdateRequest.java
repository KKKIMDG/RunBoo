package com.runboo.domain.usersetting.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;

@Getter
public class UserSettingUpdateRequest {

    private Boolean pushEnabled;
    private Boolean voiceGuideEnabled;

    @Pattern(regexp = "MALE|FEMALE")
    private String voiceType;

    @Pattern(regexp = "LIGHT|DARK|SYSTEM")
    private String themeMode;

    @Pattern(regexp = "SMALL|MEDIUM|LARGE")
    private String fontSize;
}
