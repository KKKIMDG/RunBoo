// src/services/tierService.ts
import { api } from './api';
import { TierEvaluationRequest, TierData } from '@/types/tier';

export const evaluateTier = async (params: TierEvaluationRequest): Promise<TierData> => {
    const response = await api.post<TierData>('/tiers/evaluate', params);
    return response.data;
};