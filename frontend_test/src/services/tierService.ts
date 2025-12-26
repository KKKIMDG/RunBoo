// src/services/tierService.ts
import { api } from '@/services/api';
import { TierEvaluationRequest, TierData } from '@/types/tier';

export const evaluateTier = (requestData: TierEvaluationRequest): Promise<TierData> => {
  // api.post는 두 번째 인자로 전달된 객체를 JSON.stringify하여 본문(Body)에 담습니다.
  return api.post('/api/tier/evaluate', requestData);
};