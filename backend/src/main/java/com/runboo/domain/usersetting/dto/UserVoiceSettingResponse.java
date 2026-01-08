package com.runboo.domain.usersetting.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserVoiceSettingResponse {
    private boolean voiceGuideEnabled;
    private String voiceType;
}
