import { useRef, useEffect, useState } from "react";
import * as Speech from "expo-speech";

interface VoiceFeedbackProps {
    isMale: boolean;
    targetDistance: number;

    recommendedPaceSec?: number; // sec/km
    minRecordDistanceM?: number; // default 100 (※ 이제 음성 안내는 안 씀)

    ghostDiffUnitM?: number; // default 100
    ghostDiffCooldownMs?: number; // default 6000
    ghostPaceSimilarThresholdSec?: number; // default 5
    ghostBlockAfterStartMs?: number; // default 15000
}

export const useRunningVoiceFeedback = ({
                                            isMale,
                                            targetDistance,
                                            recommendedPaceSec,
                                            minRecordDistanceM = 100,

                                            ghostDiffUnitM = 100,
                                            ghostDiffCooldownMs = 6000,
                                            ghostPaceSimilarThresholdSec = 5,
                                            ghostBlockAfterStartMs = 15000,
                                        }: VoiceFeedbackProps) => {
    const lastCheckedKm = useRef(0);
    const startTime = useRef(Date.now());
    const milestones = useRef({ p50: false, p80: false, p90: false });

    // ✅ 말 겹침 방지
    const speakingLock = useRef(false);

    // ✅ [추가] 시작 멘트 2번 방지 (어디서 2번 호출해도 1번만)
    const lastStartSpokenAtRef = useRef<number>(0);
    const START_DEDUP_MS = 2000; // 2초 이내 중복 호출 무시

    // ✅ 고스트 격차 안내용 상태(ref)
    const ghostLastSpokenAtRef = useRef<number>(0);
    const ghostLastBucketRef = useRef<number | null>(null);
    const ghostLastSignRef = useRef<number>(0);
    const ghostLastPaceSimilarRef = useRef<boolean>(false);
    const ghostBlockUntilRef = useRef<number>(0);

    // iOS/Android 모두: 선택된 음성 identifier(가능하면 적용)
    const [selectedVoice, setSelectedVoice] = useState<string | undefined>(
        undefined
    );

    /** -----------------------------
     * 시스템 음성 선택
     * - 남성: Minsu
     * - 여성: Suhyun
     * - Enhanced 제외 → 무료 음성 우선
     * ----------------------------- */
    useEffect(() => {
        (async () => {
            try {
                const voices = await Speech.getAvailableVoicesAsync();

                const koVoices = voices.filter((v) =>
                    (v.language || "").toLowerCase().startsWith("ko")
                );

                const freeKo = koVoices.filter(
                    (v) => (v.quality || "").toLowerCase() !== "enhanced"
                );

                const pool =
                    freeKo.length > 0
                        ? freeKo
                        : koVoices.length > 0
                            ? koVoices
                            : voices;

                const targetName = isMale ? "minsu" : "suhyun";
                const found = pool.find((v) =>
                    (v.name || "").toLowerCase().includes(targetName)
                );

                setSelectedVoice(found?.identifier ?? pool[0]?.identifier);
            } catch {
                setSelectedVoice(undefined);
            }
        })();
    }, [isMale]);

    /** -----------------------------
     * AI 기준 페이스 계산
     * ----------------------------- */
    const getAiRecommendedPace = () => {
        if (targetDistance <= 3000) return 330;
        if (targetDistance <= 5000) return 360;
        return 390;
    };
    const aiTargetPaceSec = recommendedPaceSec ?? getAiRecommendedPace();

    /** -----------------------------
     * 발화 함수 (hook 내부만 사용)
     * ----------------------------- */
    const speak = async (text: string, onDone?: () => void) => {
        if (speakingLock.current) return;
        speakingLock.current = true;

        try {
            await Speech.stop();

            Speech.speak(text, {
                language: "ko-KR",
                voice: selectedVoice,
                pitch: 1.0,
                rate: 1.0,
                onDone: () => {
                    speakingLock.current = false;
                    onDone?.();
                },
                onStopped: () => {
                    speakingLock.current = false;
                },
                onError: () => {
                    speakingLock.current = false;
                },
            });
        } catch {
            speakingLock.current = false;
        }
    };

    /** -----------------------------
     * 시작 / 종료 / 일시정지 / 재개
     * ----------------------------- */
    const speakStart = () => {
        // ✅ [핵심] 2초 내 중복 호출 차단
        const now = Date.now();
        if (now - lastStartSpokenAtRef.current < START_DEDUP_MS) return;
        lastStartSpokenAtRef.current = now;

        const km = targetDistance / 1000;
        const paceMin = Math.floor(aiTargetPaceSec / 60);
        const paceSec = aiTargetPaceSec % 60;

        // ✅ 시작 멘트 동안 고스트 격차 안내 잠깐 막기
        ghostBlockUntilRef.current = Number.MAX_SAFE_INTEGER;

        speak(
            `목표 거리 ${km} 킬로미터 측정을 시작합니다. 권장 페이스는 ${paceMin}분 ${paceSec}초입니다. 파이팅!`,
            () => {
                ghostBlockUntilRef.current = Date.now() + ghostBlockAfterStartMs;
            }
        );

        startTime.current = Date.now();
        lastCheckedKm.current = 0;
        milestones.current = { p50: false, p80: false, p90: false };
    };

    const speakStop = (finalDist: number, onComplete?: () => void) => {
        const km = (finalDist / 1000).toFixed(2);
        speak(`측정을 종료합니다. 총 ${km} 킬로미터를 달렸습니다.`, onComplete);

        // ✅ 다음 러닝 시작 멘트가 정상적으로 나오도록 리셋
        lastStartSpokenAtRef.current = 0;
    };

    const speakPause = () => speak("운동을 일시 정지합니다.");
    const speakResume = () => speak("러닝을 다시 시작합니다.");

    // ✅ [요구] 100m 미만 종료 시 “기록 안 됨” 음성 안내는 제거
    const speakMinDistanceWarning = () => {
        // intentionally empty
        // (UI/Alert 등 텍스트 안내로만 처리)
        void minRecordDistanceM;
    };

    /** -----------------------------
     * km 체크 & 페이스 피드백
     * ----------------------------- */
    const checkAndSpeak = (currentDistanceMeter: number) => {
        const currentKm = Math.floor(currentDistanceMeter / 1000);
        const progress =
            targetDistance > 0 ? (currentDistanceMeter / targetDistance) * 100 : 0;

        if (currentKm > lastCheckedKm.current && currentKm > 0) {
            lastCheckedKm.current = currentKm;

            const elapsedMin = (Date.now() - startTime.current) / 60000;
            const currentPaceSec = (elapsedMin * 60) / (currentDistanceMeter / 1000);

            const pMin = Math.floor(currentPaceSec / 60);
            const pSec = Math.round(currentPaceSec % 60);

            let feedback = `${currentKm} 킬로미터 통과. 현재 페이스는 ${pMin}분 ${pSec}초입니다. `;

            if (progress >= 50 && !milestones.current.p50) {
                milestones.current.p50 = true;
                feedback += "절반 지났습니다. 지금 페이스 아주 좋아요. ";
            } else if (progress >= 90 && !milestones.current.p90) {
                milestones.current.p90 = true;
                feedback += "이제 얼마 안 남았습니다. 끝까지 밀어봅시다! ";
            }

            if (currentPaceSec < aiTargetPaceSec - 30) {
                feedback += "조금 빠릅니다. 호흡을 정리해 주세요.";
            } else if (currentPaceSec > aiTargetPaceSec + 30) {
                feedback += "여유가 있습니다. 살짝 속도를 올려볼까요?";
            }

            speak(feedback);
        }
    };

    /** -----------------------------
     * 고스트 전용: 100m 격차 안내
     * ----------------------------- */
    const resetGhostDiff = () => {
        ghostLastSpokenAtRef.current = 0;
        ghostLastBucketRef.current = null;
        ghostLastSignRef.current = 0;
        ghostLastPaceSimilarRef.current = false;
        ghostBlockUntilRef.current = 0;
    };

    const checkAndSpeakGhostDiff = (
        diffM: number,
        paceDiffSec: number,
        ctx: { isReady: boolean; isRunning: boolean; isPaused: boolean; timeSec: number }
    ) => {
        const { isReady, isRunning, isPaused, timeSec } = ctx;

        if (timeSec <= 0) {
            resetGhostDiff();
            return;
        }

        if (isReady) return;
        if (!isRunning) return;
        if (isPaused) return;

        const now = Date.now();
        if (speakingLock.current) return;
        if (now < ghostBlockUntilRef.current) return;

        const d = Number(diffM);
        if (!Number.isFinite(d)) return;

        const absM = Math.abs(d);
        const bucket = Math.floor(absM / ghostDiffUnitM);
        const sign = absM < 1 ? 0 : d > 0 ? 1 : -1;

        const pd = Number(paceDiffSec);
        const isPaceSimilar =
            Number.isFinite(pd) && Math.abs(pd) <= ghostPaceSimilarThresholdSec;

        const bucketChanged =
            ghostLastBucketRef.current === null || bucket !== ghostLastBucketRef.current;
        const signChanged = sign !== ghostLastSignRef.current;
        const paceSimilarChanged = isPaceSimilar !== ghostLastPaceSimilarRef.current;

        const cooldownPassed =
            now - ghostLastSpokenAtRef.current >= ghostDiffCooldownMs;

        if (!signChanged && !cooldownPassed) return;
        if (!bucketChanged && !signChanged && !paceSimilarChanged) return;

        let msg = "";

        if (bucket === 0) {
            msg = isPaceSimilar
                ? "고스트와 거의 나란히 달리고 있어요. 페이스도 비슷해요. 지금처럼 유지해요."
                : "고스트와 거의 나란히 달리고 있어요.";
        } else {
            const m = bucket * ghostDiffUnitM;
            msg =
                sign > 0
                    ? `고스트보다 ${m}미터 뒤처지고 있어요.`
                    : `좋아요. 고스트보다 ${m}미터 앞서고 있어요.`;
            if (isPaceSimilar) msg += " 페이스는 거의 비슷해요.";
        }

        if (!msg) return;

        speak(msg);

        ghostLastSpokenAtRef.current = now;
        ghostLastBucketRef.current = bucket;
        ghostLastSignRef.current = sign;
        ghostLastPaceSimilarRef.current = isPaceSimilar;
    };

    useEffect(() => {
        return () => {
            Speech.stop();
        };
    }, []);

    return {
        checkAndSpeak,
        speakStart,
        speakPause,
        speakResume,
        speakStop,
        speakMinDistanceWarning, // ✅ no-op 유지(호출돼도 말 안 함)
        checkAndSpeakGhostDiff,
        resetGhostDiff,
    };
};
