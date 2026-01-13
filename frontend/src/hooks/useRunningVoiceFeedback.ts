// frontend/src/hooks/useRunningVoiceFeedback.ts
import { useRef, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Speech from "expo-speech";

interface VoiceFeedbackProps {
  isMale: boolean;
  targetDistance: number;
  recommendedPaceSec?: number; // sec/km
  minRecordDistanceM?: number; // default 100
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
  const speakingLock = useRef(false);

  // iOS 무료 음성 선택
  const [selectedVoice, setSelectedVoice] = useState<string | undefined>(
    undefined
  );

  /** -----------------------------
   * iOS 시스템 음성 선택
   * - 남성: Minsu
   * - 여성: Sora
   * - Enhanced 제외 → 무료 음성
   * ----------------------------- */
  useEffect(() => {
    if (Platform.OS === "ios") {
      (async () => {
        try {
          const voices = await Speech.getAvailableVoicesAsync();

          const freeVoices = voices.filter(
            (v) => v.quality?.toLowerCase() !== "enhanced"
          );

          const targetName = isMale ? "minsu" : "suhyun";
          const foundVoice = freeVoices.find((v) =>
            v.name?.toLowerCase().includes(targetName)
          );

          setSelectedVoice(foundVoice?.identifier ?? freeVoices[0]?.identifier);
          console.log(
            "🎙 선택된 iOS 무료 음성:",
            foundVoice?.name ?? freeVoices[0]?.name
          );
        } catch (e) {
          console.warn("iOS voices fetch failed", e);
        }
      })();
    }
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
   * 발화 함수 (iOS/Android 공용)
   * ----------------------------- */
  const speak = async (text: string, onDone?: () => void) => {
    if (speakingLock.current) return;
    speakingLock.current = true;

    console.log(`📢 [Voice Feedback]: ${text}`);

    try {
      await Speech.stop();

      await Speech.speak(text, {
        language: "ko-KR",
        voice: Platform.OS === "ios" ? selectedVoice : undefined,
        pitch: isMale ? 1.0 : 1.0,
        rate: Platform.OS === "ios" ? 1.0 : 1.0,
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
    const km = targetDistance / 1000;
    const paceMin = Math.floor(aiTargetPaceSec / 60);
    const paceSec = aiTargetPaceSec % 60;

    speak(
      `목표 거리 ${km} 킬로미터 측정을 시작합니다. 권장 페이스는 ${paceMin}분 ${paceSec}초입니다. 파이팅!`
    );

    startTime.current = Date.now();
    lastCheckedKm.current = 0;
    milestones.current = { p50: false, p80: false, p90: false };
  };

  const speakStop = (finalDist: number, onComplete?: () => void) => {
    const km = (finalDist / 1000).toFixed(2);
    speak(`측정을 종료합니다. 총 ${km} 킬로미터를 달렸습니다.`, onComplete);
  };

  const speakPause = () => speak("러닝을 일시 정지합니다.");
  const speakResume = () => speak("러닝을 다시 시작합니다.");
  const speakMinDistanceWarning = () => {
    speak(`최소 ${minRecordDistanceM}m 는 뛰어야 런닝 내용이 기록돼요`);
  };

  /** -----------------------------
   * km 체크 & 페이스 피드백
   * ----------------------------- */
  const checkAndSpeak = (currentDistanceMeter: number) => {
    const currentKm = Math.floor(currentDistanceMeter / 1000);
    const progress = (currentDistanceMeter / targetDistance) * 100;

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

  // iOS 언마운트 시 발화 정리
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
    speakMinDistanceWarning,
  };
};
