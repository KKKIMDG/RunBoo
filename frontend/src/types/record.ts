export type RecordDto = {
  id: number;
  distanceM: number;
  durationSec: number;
  avgPace: number;
  calories: number;
  startedAt: string; // OffsetDateTime
  endedAt: string;
  mode: string; // "NORMAL" | "GHOST" | "TIER"
};

export type MonthlySummaryDto = {
  totalRuns: number;
  totalDistanceM: number;
  totalDurationSec: number;
  totalCalories: number;
};

export type WeeklyItemDto = {
  date: string; // LocalDate (YYYY-MM-DD)
  runs: number;
  distanceM: number;
  durationSec: number;
  calories: number;
};

export type WeeklySummaryDto = {
  items: WeeklyItemDto[];
};

export type PersonalBestsDto = {
  longestDistance: RecordDto | null;
  longestDuration: RecordDto | null;
  bestPace: RecordDto | null;
  mostCalories: RecordDto | null;
};

export type DashboardStatsDto = {
  monthly: MonthlySummaryDto;
  weekly: WeeklySummaryDto;
  personalBests: PersonalBestsDto;
};