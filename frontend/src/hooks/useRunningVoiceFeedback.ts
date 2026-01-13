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
  const [androidMaleVoice, setAndroidMaleVoice] = useState<string | undefined>();
  const [androidFemaleVoice, setAndroidFemaleVoice] = useState<string | undefined>();

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
    (async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();

        const koVoices = voices.filter(
            (v) => v.language?.toLowerCase().startsWith("ko")
        );

        // -----------------
        // iOS
        // -----------------
        if (Platform.OS === "ios") {
          const freeVoices = koVoices.filter(
              (v) => v.quality?.toLowerCase() !== "enhanced"
          );

          const targetName = isMale ? "minsu" : "suhyun";
          const found = freeVoices.find((v) =>
              v.name?.toLowerCase().includes(targetName)
          );

          setSelectedVoice(found?.identifier ?? freeVoices[0]?.identifier);
          return;
        }

        // -----------------
        // Android (이름 기반)
        // -----------------
        if (Platform.OS === "android") {
          // 1. 한국어만
          const koSpecificVoices = koVoices.filter(
              v => v.language === "ko-KR"
          );

          // 2. 정확한 남/여 분리
          const maleVoices = koSpecificVoices.filter(v =>
              v.name.includes("kod")
          );

          const femaleVoices = koSpecificVoices.filter(v =>
              v.name.includes("koc") || v.name.includes("kob")
          );

          // 3. local 우선 → 없으면 network
          const pickBestVoice = (candidates: typeof koSpecificVoices) => {
            if (candidates.length === 0) return undefined;
            return (
                candidates.find(v => v.name.includes("local")) ??
                candidates.find(v => v.name.includes("network")) ??
                candidates[0]
            );
          };

          const finalMale = pickBestVoice(maleVoices);
          const finalFemale = pickBestVoice(femaleVoices);

          // 4. fallback (절대 ism 쓰지 말 것)
          const fallback = koSpecificVoices.find(
              v => !v.name.includes("ism")
          )?.identifier;

          setAndroidMaleVoice(finalMale?.identifier ?? fallback);
          setAndroidFemaleVoice(finalFemale?.identifier ?? fallback);

          console.log("남성(Android):", finalMale?.name);
          console.log("여성(Android):", finalFemale?.name);
        }

      } catch (e) {
        console.warn("Voice fetch failed", e);
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
   * 발화 옵션 (iOS / Android 분기)
   * ----------------------------- */
  const getSpeechOptions = () => {
    if (Platform.OS === "ios") {
      return {
        language: "ko-KR",
        voice: selectedVoice,
        pitch: isMale ? 1.0 : 1.0,
        rate: 1.0,
      };
    }

    // Android
    return {
      language: "ko-KR",
      voice: isMale ? androidMaleVoice : androidFemaleVoice,
      pitch: isMale ? 1.0 : 1.0,
      rate: 1,
    };
  };


  /** -----------------------------
   * 발화 함수 (iOS/Android 공용)
   * ----------------------------- */
  const speak = async (text: string, onDone?: () => void) => {
    if (speakingLock.current) return;
    speakingLock.current = true;

    console.log(`📢 [Voice Feedback]: ${text}`);

    try {
      await Speech.stop();

      const options = getSpeechOptions();

      await Speech.speak(text, {
        ...options,
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
