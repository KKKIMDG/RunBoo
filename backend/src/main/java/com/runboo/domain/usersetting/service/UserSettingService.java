package com.runboo.domain.usersetting.service;

import com.runboo.domain.usersetting.dto.UserSettingResponse;
import com.runboo.domain.usersetting.dto.UserSettingUpdateRequest;
import com.runboo.domain.usersetting.entity.UserSetting;
import com.runboo.domain.usersetting.repository.UserSettingRepository;
import com.runboo.global.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserSettingService {

    private final UserSettingRepository userSettingRepository;

    @Transactional(readOnly = true)
    public UserSettingResponse getSettings() {
        Long userId = SecurityUtil.getCurrentUserId();

        UserSetting setting = userSettingRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("유저 설정이 존재하지 않습니다."));

        return UserSettingResponse.from(setting);
    }

    @Transactional
    public void updateSettings(UserSettingUpdateRequest request) {
        Long userId = SecurityUtil.getCurrentUserId();

        UserSetting setting = userSettingRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("유저 설정이 존재하지 않습니다."));

        setting.updatePushEnabled(request.getPushEnabled());
        setting.updateVoiceGuideEnabled(request.getVoiceGuideEnabled());
        setting.updateVoiceType(request.getVoiceType());
        setting.updateThemeMode(request.getThemeMode());
        setting.updateFontSize(request.getFontSize());
        setting.updateLocationPermission(request.getLocationPermission());
    }
}
