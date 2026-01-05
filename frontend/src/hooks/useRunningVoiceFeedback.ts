import { useRef } from "react";
import * as Speech from "expo-speech";

interface VoiceFeedbackProps {
  isMale: boolean;
  targetDistance: number; // 3000, 5000, 10000
}

export const useRunningVoiceFeedback = ({
  isMale,
  targetDistance,
}: VoiceFeedbackProps) => {
  const lastCheckedKm = useRef(0);
  const startTime = useRef(Date.now());
  const milestones = useRef({ p50: false, p80: false, p90: false });

  // ✅ 목표 거리에 따른 AI 권장 페이스 설정 (초 단위/km)
  // 3km: 5분 30초 (330s), 5km: 6분 (360s), 10km: 6분 30초 (390s)
  const getAiRecommendedPace = () => {
    if (targetDistance <= 3000) return 330;
    if (targetDistance <= 5000) return 360;
    return 390;
  };

  const aiTargetPaceSec = getAiRecommendedPace();

  const speak = (text: string) => {
    console.log(`📢 [AI코치 발화]: ${text}`);
    Speech.speak(text, {
      language: "ko-KR",
      pitch: isMale ? 0.8 : 1.1,
      rate: 1.0,
    });
  };

  const speakStart = async () => {
    const km = targetDistance / 1000;
    const paceMin = Math.floor(aiTargetPaceSec / 60);
    const paceSec = aiTargetPaceSec % 60;

    speak(
      `목표 거리 ${km} 킬로미터 측정을 시작합니다. AI 권장 페이스는 ${paceMin}분 ${paceSec}초입니다. 페이스에 맞춰 안전하게 완주해 보세요!`
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

      // 목표 거리 구간별 응원
      if (progress >= 50 && !milestones.current.p50) {
        milestones.current.p50 = true;
        feedback += "절반을 지나고 있습니다! 지금 페이스 아주 좋아요. ";
      } else if (progress >= 90 && !milestones.current.p90) {
        milestones.current.p90 = true;
        feedback += "마지막 10퍼센트 남았습니다! 스퍼트를 올려보세요! ";
      }

      // ✅ AI 권장 페이스와 비교 피드백 (오차 30초 기준)
      if (currentPaceSec < aiTargetPaceSec - 30) {
        feedback += "권장 속도보다 빠릅니다. 완주를 위해 힘을 아끼세요.";
      } else if (currentPaceSec > aiTargetPaceSec + 30) {
        feedback += "권장 속도보다 느립니다. 조금만 더 속도를 내볼까요?";
      }

      speak(feedback);
    }
  };

  const speakPause = () => speak("운동을 일시 정지합니다.");
  const speakResume = () => speak("러닝을 다시 시작합니다.");
  const speakStop = (finalDist: number) => {
    const km = (finalDist / 1000).toFixed(2);
    let msg = `러닝을 종료합니다. 총 ${km} 킬로미터를 달렸습니다. `;
    if (finalDist >= targetDistance)
      msg += "목표 거리를 달성하셨네요! 정말 대단합니다.";
    speak(msg);
  };

  return { checkAndSpeak, speakStart, speakPause, speakResume, speakStop };
};
