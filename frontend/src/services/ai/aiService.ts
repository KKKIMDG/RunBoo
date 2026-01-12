import { api } from "@/services/api";

export interface AnalysisResponse {
  markdownContent: string | null;
  remainingCount: number;
  isSubscribed: boolean;
}

export async function fetchAiStatus(): Promise<AnalysisResponse> {
  const res = await api.get("/api/ai/status");
  return res as AnalysisResponse;
}

export async function analyzeRunRecords(): Promise<AnalysisResponse> {
  const res = await api.post("/api/ai/analyze", {});
  return res as AnalysisResponse;
}
