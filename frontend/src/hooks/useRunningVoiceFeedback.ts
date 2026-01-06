import { useRef } from "react";
import * as Speech from "expo-speech";

interface VoiceFeedbackProps {
  isMale: boolean;
  targetDistance: number;
}

export const useRunningVoiceFeedback = ({
  isMale,
  targetDistance,
}: VoiceFeedbackProps) => {
  const lastCheckedKm = useRef(0);
  const startTime = useRef(Date.now());
  const milestones = useRef({ p50: false, p80: false, p90: false });

  const getAiRecommendedPace = () => {
    if (targetDistance <= 3000) return 330;
    if (targetDistance <= 5000) return 360;
    return 390;
  };

  const aiTargetPaceSec = getAiRecommendedPace();

  // ✅ 핵심 수정: 새로운 발화 전 기존 음성을 무조건 끊음
  const speak = (text: string, onDone?: () => void) => {
    console.log(`📢 [AI코치 발화]: ${text}`);

    // 이전 음성 즉시 중단
    Speech.stop().then(() => {
      Speech.speak(text, {
        language: "ko-KR",
        pitch: isMale ? 0.5 : 1.0,
        rate: 1.1,
        onDone: () => {
          if (onDone) onDone();
        },
      });
    });
  };

  const speakStart = async () => {
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
        feedback += "절반이나 왔어요! 페이스 유지하세요. ";
      } else if (progress >= 90 && !milestones.current.p90) {
        milestones.current.p90 = true;
        feedback += "마지막 스퍼트! 목표가 코앞입니다! ";
      }

      if (currentPaceSec < aiTargetPaceSec - 30) {
        feedback += "현재 페이스가 빠릅니다. 속도를 조금 늦추세요.";
      } else if (currentPaceSec > aiTargetPaceSec + 30) {
        feedback += "조금만 더 속도를 높여볼까요?";
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

  return { checkAndSpeak, speakStart, speakPause, speakResume, speakStop };
};
