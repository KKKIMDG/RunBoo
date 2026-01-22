// frontend/src/hooks/useRunningVoiceFeedback.ts
import { useRef, useEffect, useState } from "react";
import { Platform } from "react-native";
import * as Speech from "expo-speech";
import {
  setAudioModeAsync,
  setIsAudioActiveAsync,
  AudioMode,
} from "expo-audio";

// 음성 안내 시 음악 볼륨 줄이기 모드
const DUCK_MODE: Partial<AudioMode> = {
  allowsRecording: false,
  interruptionMode: "duckOthers",
  playsInSilentMode: true,
  shouldPlayInBackground: true,
};

// 음성 안내 종료 후 정상 모드
const NORMAL_MODE: Partial<AudioMode> = {
  allowsRecording: false,
  interruptionMode: "mixWithOthers",
  playsInSilentMode: false,
  shouldPlayInBackground: true,
};

interface VoiceFeedbackProps {
  isMale: boolean;
  targetDistance: number;

  recommendedPaceSec?: number; // sec/km
  minRecordDistanceM?: number; // default 100 (※ 현재 버전에서는 음성 안내는 안 씀)

  // ghost voice feedback
  ghostDiffUnitM?: number; // default 100
  ghostDiffCooldownMs?: number; // default 6000
  ghostPaceSimilarThresholdSec?: number; // default 5
  ghostBlockAfterStartMs?: number; // default 15000

  // duck 시 무음 오디오를 재생해 오디오 포커스 확보할지 여부 (기본 true)
  duckWithSilentAudio?: boolean;
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
  // 새로운 옵션: 무음 파일 재생으로 더 강한 duck 확보
  duckWithSilentAudio = true,
}: VoiceFeedbackProps) => {
  const lastCheckedKm = useRef(0);
  const startTime = useRef(Date.now());
  const milestones = useRef({ p50: false, p80: false, p90: false });

  // ✅ 말 겹침 방지
  const speakingLock = useRef(false);

  // ✅ 시작 멘트 2번 방지
  const lastStartSpokenAtRef = useRef<number>(0);
  const START_DEDUP_MS = 2000;

  // ✅ 고스트 격차 안내용 상태(ref)
  const ghostLastSpokenAtRef = useRef<number>(0);
  const ghostLastBucketRef = useRef<number | null>(null);
  const ghostLastSignRef = useRef<number>(0);
  const ghostLastPaceSimilarRef = useRef<boolean>(false);
  const ghostBlockUntilRef = useRef<number>(0);

  // iOS 음성 identifier
  const [selectedVoice, setSelectedVoice] = useState<string | undefined>(
    undefined,
  );

  // Android 음성 identifier (남/여)
  const [androidMaleVoice, setAndroidMaleVoice] = useState<string | undefined>(
    undefined,
  );
  const [androidFemaleVoice, setAndroidFemaleVoice] = useState<
    string | undefined
  >(undefined);

  /** -----------------------------
   * 시스템 음성 선택
   * - iOS: Enhanced 제외(무료) + 남성 Minsu / 여성 Suhyun 우선
   * - Android: ko-KR 중 이름 패턴(kod/koc/kob) + local 우선
   * ----------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();

        // 한국어 음성 후보
        const koVoices = voices.filter((v) =>
          (v.language || "").toLowerCase().startsWith("ko"),
        );

        // -----------------
        // iOS
        // -----------------
        if (Platform.OS === "ios") {
          const freeKo = koVoices.filter(
            (v) => (v.quality || "").toLowerCase() !== "enhanced",
          );

          const pool =
            freeKo.length > 0
              ? freeKo
              : koVoices.length > 0
                ? koVoices
                : voices;

          const targetName = isMale ? "minsu" : "suhyun";
          const found = pool.find((v) =>
            (v.name || "").toLowerCase().includes(targetName),
          );

          setSelectedVoice(found?.identifier ?? pool[0]?.identifier);
          return;
        }

        // -----------------
        // Android
        // -----------------
        if (Platform.OS === "android") {
          // 1) ko-KR만
          const koSpecificVoices = koVoices.filter(
            (v) => v.language === "ko-KR",
          );

          // 2) 남/여 후보 (요구사항: ism 절대 사용 X)
          const maleVoices = koSpecificVoices.filter((v) =>
            (v.name || "").includes("kod"),
          );
          const femaleVoices = koSpecificVoices.filter(
            (v) =>
              (v.name || "").includes("koc") || (v.name || "").includes("kob"),
          );

          // 3) local 우선 → network → 첫 번째
          const pickBestVoice = (candidates: typeof koSpecificVoices) => {
            if (candidates.length === 0) return undefined;
            return (
              candidates.find((v) => (v.name || "").includes("local")) ??
              candidates.find((v) => (v.name || "").includes("network")) ??
              candidates[0]
            );
          };

          const finalMale = pickBestVoice(maleVoices);
          const finalFemale = pickBestVoice(femaleVoices);

          // 4) fallback: ism 제외한 아무거나
          const fallback = koSpecificVoices.find(
            (v) => !(v.name || "").includes("ism"),
          )?.identifier;

          setAndroidMaleVoice(finalMale?.identifier ?? fallback);
          setAndroidFemaleVoice(finalFemale?.identifier ?? fallback);

          // iOS 전용 상태는 비워둠(혼동 방지)
          setSelectedVoice(undefined);
        }
      } catch (e) {
        setSelectedVoice(undefined);
        setAndroidMaleVoice(undefined);
        setAndroidFemaleVoice(undefined);
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
        pitch: 1.0,
        rate: 1.0,
      };
    }

    return {
      language: "ko-KR",
      voice: isMale ? androidMaleVoice : androidFemaleVoice,
      pitch: 1.0,
      rate: 1.0,
    };
  };

  /** -----------------------------
   * 발화 함수
   * ----------------------------- */
  const speak = async (text: string, onDone?: () => void) => {
    if (speakingLock.current) return;
    speakingLock.current = true;

    try {
      await Speech.stop();

      // TTS 시작 전: 덕킹 모드 설정 (음악 볼륨 줄임)
      await setAudioModeAsync(DUCK_MODE);

      const options = getSpeechOptions();

      Speech.speak(text, {
        ...options,
        onDone: () => {
          // TTS 종료: 오디오 세션만 비활성화 (재활성화 안 함)
          setIsAudioActiveAsync(false).catch(() => {});
          speakingLock.current = false;
          onDone?.();
        },
        onStopped: () => {
          setIsAudioActiveAsync(false).catch(() => {});
          speakingLock.current = false;
        },
        onError: () => {
          setIsAudioActiveAsync(false).catch(() => {});
          speakingLock.current = false;
        },
      });
    } catch (e) {
      // 에러 발생 시도 오디오 비활성화
      setIsAudioActiveAsync(false).catch(() => {});
      speakingLock.current = false;
    }
  };

  /** -----------------------------
   * 시작 / 종료 / 일시정지 / 재개
   * ----------------------------- */
  const speakStart = () => {
    // ✅ 2초 내 중복 호출 차단
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
      },
    );

    startTime.current = Date.now();
    lastCheckedKm.current = 0;
    milestones.current = { p50: false, p80: false, p90: false };
  };

  const speakStop = (finalDist: number, onComplete?: () => void) => {
    const km = (finalDist / 1000).toFixed(2);
    speak(`측정을 종료합니다. 총 ${km} 킬로미터를 달렸습니다.`, onComplete);

    // ✅ 다음 러닝 시작 멘트 정상화
    lastStartSpokenAtRef.current = 0;
  };

  const speakPause = () => speak("운동을 일시 정지합니다.");
  const speakResume = () => speak("러닝을 다시 시작합니다.");

  // ✅ 100m 미만 종료 시 “기록 안 됨” 음성 안내는 제거 (요구사항 유지)
  const speakMinDistanceWarning = () => {
    // intentionally empty
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
    ctx: {
      isReady: boolean;
      isRunning: boolean;
      isPaused: boolean;
      timeSec: number;
    },
  ) => {
    const { isReady, isRunning, isPaused, timeSec } = ctx;

    // 러닝 타이머가 0이면(또는 새 세션 시작 직후) 상태 리셋
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
    const sign = absM < 1 ? 0 : d > 0 ? 1 : -1; // +: 뒤처짐, -: 앞섬(메시지 기준)

    const pd = Number(paceDiffSec);
    const isPaceSimilar =
      Number.isFinite(pd) && Math.abs(pd) <= ghostPaceSimilarThresholdSec;

    const bucketChanged =
      ghostLastBucketRef.current === null ||
      bucket !== ghostLastBucketRef.current;
    const signChanged = sign !== ghostLastSignRef.current;
    const paceSimilarChanged =
      isPaceSimilar !== ghostLastPaceSimilarRef.current;

    const cooldownPassed =
      now - ghostLastSpokenAtRef.current >= ghostDiffCooldownMs;

    // 방향(앞/뒤)이 안 바뀌었는데 쿨다운도 안 지났으면 말하지 않음
    if (!signChanged && !cooldownPassed) return;

    // 버킷/방향/페이스유사도 변화도 없으면 말하지 않음
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

  // 언마운트 시 발화 정리
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
    speakMinDistanceWarning, // ✅ no-op 유지
    checkAndSpeakGhostDiff,
    resetGhostDiff,
  };
};
