// frontend/src/hooks/useRunningVoiceFeedback.ts

import { useRef } from "react";
import * as Speech from "expo-speech";

interface VoiceFeedbackProps {
    isMale: boolean;
    targetDistance: number; // meter
    recommendedPaceSec?: number; // sec/km (고스트 평균 페이스 등으로 override 가능)
    minRecordDistanceM?: number; // default 100m
}

export const useRunningVoiceFeedback = ({
                                            isMale,
                                            targetDistance,
                                            recommendedPaceSec,
                                            minRecordDistanceM = 100,
                                        }: VoiceFeedbackProps) => {
    const lastCheckedKm = useRef(0);
    const startTime = useRef(Date.now());
    const milestones = useRef({ p50: false, p80: false, p90: false });

    // 발화 꼬임 방지용 토큰
    const speakTokenRef = useRef(0);

    const getAiRecommendedPace = () => {
        if (targetDistance <= 3000) return 330;
        if (targetDistance <= 5000) return 360;
        return 390;
    };

    const aiTargetPaceSec = recommendedPaceSec ?? getAiRecommendedPace();

    // ✅ 핵심: 새 발화 전 기존 음성 즉시 중단 + 토큰으로 onDone 꼬임 방지
    const speak = (text: string, onDone?: () => void) => {
        console.log(`📢 [AI코치 발화]: ${text}`);

        const myToken = ++speakTokenRef.current;

        // expo-speech의 stop()은 Promise가 아닐 수 있어서 then 체인 제거
        Speech.stop();

        Speech.speak(text, {
            language: "ko-KR",
            pitch: isMale ? 0.5 : 1.0,
            rate: 1.1,
            onDone: () => {
                // 최신 발화만 onDone 실행
                if (myToken === speakTokenRef.current) {
                    onDone?.();
                }
            },
        });
    };

    const resetVoiceState = () => {
        startTime.current = Date.now();
        lastCheckedKm.current = 0;
        milestones.current = { p50: false, p80: false, p90: false };
    };

    const speakStart = () => {
        const km = targetDistance / 1000;
        const paceMin = Math.floor(aiTargetPaceSec / 60);
        const paceSec = aiTargetPaceSec % 60;

        speak(
            `목표 거리 ${km.toFixed(1)} 킬로미터 측정을 시작합니다. 권장 페이스는 ${paceMin}분 ${paceSec}초입니다. 파이팅!`
        );
        resetVoiceState();
    };

    const checkAndSpeak = (currentDistanceMeter: number) => {
        if (!targetDistance || targetDistance <= 0) return;

        const currentKm = Math.floor(currentDistanceMeter / 1000);
        const progress = (currentDistanceMeter / targetDistance) * 100;

        // 1km 단위 통과 안내
        if (currentKm > lastCheckedKm.current && currentKm > 0) {
            lastCheckedKm.current = currentKm;

            const elapsedMin = (Date.now() - startTime.current) / 60000;
            const currentPaceSec =
                currentDistanceMeter > 0
                    ? (elapsedMin * 60) / (currentDistanceMeter / 1000)
                    : 0;

            const pMin = Math.floor(currentPaceSec / 60);
            const pSec = Math.round(currentPaceSec % 60);

            let feedback = `${currentKm} 킬로미터 통과. 현재 페이스는 ${pMin}분 ${pSec}초입니다. `;

            if (progress >= 50 && !milestones.current.p50) {
                milestones.current.p50 = true;
                feedback += "절반이나 왔어요! 페이스 유지하세요. ";
            } else if (progress >= 90 && !milestones.current.p90) {
                milestones.current.p90 = true;
                feedback += "마지막 스퍼트! 목표가 코앞입니다! ";
            }

            if (currentPaceSec > 0) {
                if (currentPaceSec < aiTargetPaceSec - 30) {
                    feedback += "현재 페이스가 빠릅니다. 속도를 조금 늦추세요.";
                } else if (currentPaceSec > aiTargetPaceSec + 30) {
                    feedback += "조금만 더 속도를 높여볼까요?";
                }
            }

            speak(feedback);
        }
    };

    const speakPause = () => speak("운동을 일시 정지합니다.");
    const speakResume = () => speak("러닝을 다시 시작합니다.");

    const speakStop = (finalDist: number, onComplete?: () => void) => {
        const km = (finalDist / 1000).toFixed(2);
        const msg = `측정을 종료합니다. 총 ${km} 킬로미터를 달렸습니다. 정말 수고하셨습니다!`;
        speak(msg, onComplete);
    };

    // ✅ 100m 이내 기록 방지 음성
    const speakMinDistanceWarning = () => {
        speak(`최소 ${minRecordDistanceM}m 는 뛰어야 런닝 내용이 기록돼요`);
    };

    return {
        // core
        checkAndSpeak,
        speakStart,
        speakPause,
        speakResume,
        speakStop,

        // extra
        speakMinDistanceWarning,
        resetVoiceState,
    };
};
