package com.runboo.domain.usersetting.dto;

import com.runboo.domain.usersetting.entity.UserSetting;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserSettingResponse {

    private boolean pushEnabled;
    private boolean voiceGuideEnabled;
    private String voiceType;
    private String themeMode;
    private String fontSize;
    private String locationPermission;

    public static UserSettingResponse from(UserSetting setting) {
        return new UserSettingResponse(
                setting.isPushEnabled(),
                setting.isVoiceGuideEnabled(),
                setting.getVoiceType(),
                setting.getThemeMode(),
                setting.getFontSize(),
                setting.getLocationPermission()
        );
    }
}
