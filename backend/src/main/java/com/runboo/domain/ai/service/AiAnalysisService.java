package com.runboo.domain.ai.service;

import com.runboo.domain.record.service.AiCoachingService;
import com.runboo.domain.user.entity.User; // Member -> User 변경
import com.runboo.domain.user.repository.UserRepository; // MemberRepository -> UserRepository 변경
import com.runboo.domain.ai.dto.AnalysisResponse;
import com.runboo.domain.ai.entity.UserAiStatus;
import com.runboo.domain.ai.repository.UserAiStatusRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        if (!status.isSubscribed() && status.getRemainingCount() <= 0) {
            throw new IllegalStateException("무료 체험 횟수를 모두 사용했습니다. 프리미엄 구독이 필요합니다.");
        }

        String prompt = aiCoachingService.getMonthlyAnalysisPrompt(userId);

        if (prompt == null) {
            return new AnalysisResponse(
                    "분석할 이번 달 러닝 기록이 없습니다. 먼저 달리기를 시작해보세요!",
                    status.getRemainingCount(),
                    status.isSubscribed()
            );
        }

        String aiResult = aiCoachingService.analyze(prompt);

        if (!status.isSubscribed()) {
            status.useFreeTicket();
        }

        return new AnalysisResponse(aiResult, status.getRemainingCount(), status.isSubscribed());
    }

    private UserAiStatus createDefaultStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        return aiStatusRepository.save(new UserAiStatus(user));
    }

    @Transactional
    public UserAiStatus getStatus(Long userId) {
        return aiStatusRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultStatus(userId));
    }
}