package com.runboo.domain.ai.service;

import com.runboo.domain.record.service.AiCoachingService;
import com.runboo.domain.user.entity.User;
import com.runboo.domain.user.repository.UserRepository;
import com.runboo.domain.ai.dto.AnalysisResponse;
import com.runboo.domain.ai.dto.AiStatusViewResponse;
import com.runboo.domain.ai.entity.UserAiStatus;
import com.runboo.domain.ai.repository.UserAiStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
public class AiAnalysisService {

    private final UserAiStatusRepository aiStatusRepository;
    private final UserRepository userRepository;
    private final AiCoachingService aiCoachingService;

    @Transactional
    public AnalysisResponse analyzeRecords(Long userId) {
        UserAiStatus status = aiStatusRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultStatus(userId));

        // ✅ 1. 엔티티 내부 로직을 통해 갱신 처리
        status.renewIfNeeded();

        if (!status.isSubscribed() && status.getRemainingCount() <= 0) {
            throw new IllegalStateException("무료 체험 횟수를 모두 사용했습니다. 다음 갱신일까지 이용할 수 없습니다.");
        }

        String prompt = aiCoachingService.getMonthlyAnalysisPrompt(userId);

        if (prompt == null) {
            return new AnalysisResponse(
                    "분석할 이번 달 러닝 기록이 없습니다. 먼저 달리기를 시작해보세요!",
                    status.getRemainingCount(),
                    status.isSubscribed(),
                    calculateRemainingDays(status) // null 처리 포함
            );
        }

        String aiResult = aiCoachingService.analyze(prompt);

        // ✅ 2. 티켓 사용 (내부에서 횟수 차감 및 날짜 기록까지 처리됨)
        status.useFreeTicket();

        return new AnalysisResponse(
                aiResult,
                status.getRemainingCount(),
                status.isSubscribed(),
                calculateRemainingDays(status)
        );
    }

    @Transactional
    public AiStatusViewResponse getStatusForView(Long userId) {
        UserAiStatus status = aiStatusRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultStatus(userId));

        // Note: readOnly지만 내부 필드 상태 반영을 위해 호출 (DB 저장 안됨)
        status.renewIfNeeded();

        return new AiStatusViewResponse(
                status.getRemainingCount(),
                status.isSubscribed(),
                calculateRemainingDays(status)
        );
    }

    /**
     * ✅ 공통 로직: 남은 일수 계산
     */
    private Long calculateRemainingDays(UserAiStatus status) {
        if (!status.isSubscribed() && status.getRemainingCount() == 0 && status.getRenewAt() != null) {
            long days = ChronoUnit.DAYS.between(LocalDateTime.now(), status.getRenewAt());
            return Math.max(0, days);
        }
        return null;
    }

    private UserAiStatus createDefaultStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));
        return aiStatusRepository.save(new UserAiStatus(user));
    }
}