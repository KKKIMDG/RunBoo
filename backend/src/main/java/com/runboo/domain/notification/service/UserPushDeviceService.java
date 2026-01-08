package com.runboo.domain.notification.service;

import com.runboo.domain.notification.dto.RegisterPushDeviceRequestDto;
import com.runboo.domain.notification.entity.UserPushDevice;
import com.runboo.domain.notification.repository.UserPushDeviceRepository;
import com.runboo.global.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserPushDeviceService {

    private final UserPushDeviceRepository repository;

    /**
     * 알림 발송 대상 디바이스 조회
     * - enabled=true 인 디바이스만 반환
     * - NotificationSendFacade에서 사용
     */
    public List<UserPushDevice> getEnabledDevices(Long userId) {
        return repository.findAllByUserIdAndEnabledTrue(userId);
    }

    /**
     * FCM 디바이스 등록 / 재활성화
     *
     * 사용 시점:
     * - 로그인 직후
     * - 앱 실행 시
     *
     * 동작:
     * - 동일 token이 이미 존재하면 → touch()로 활성화 + lastSeen 갱신
     * - 없으면 → 신규 디바이스 등록
     */
    @Transactional
    public void register(RegisterPushDeviceRequestDto request) {
        Long userId = SecurityUtil.getCurrentUserId();

        repository.findByToken(request.getToken())
                .ifPresentOrElse(
                        // 기존 디바이스 재사용 (재로그인, 재설치 케이스)
                        UserPushDevice::touch,
                        // 신규 디바이스 등록
                        () -> repository.save(
                                UserPushDevice.create(
                                        userId,
                                        request.getToken(),
                                        request.getPlatform().name()
                                )
                        )
                );
    }

    /**
     * 디바이스 비활성화
     *
     * 사용 시점:
     * - 로그아웃
     * - 앱 알림 권한 해제
     *
     * 의미:
     * - 디바이스 기록은 유지
     * - 알림 발송 대상에서만 제외
     */
    @Transactional
    public void disableByToken(String token) {
        repository.findByToken(token)
                .ifPresent(UserPushDevice::disable);
    }
}
