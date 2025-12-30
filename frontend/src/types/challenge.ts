export interface BadgeDto {
  badgeId: number;
  name: string;
  description: string;
  iconUrl: string;
  difficulty: string;
}

export interface ChallengeDto {
  challengeId: number;
  title: string;
  description: string;
  difficulty: string;
  targetType: string;
  targetValue: string;
  startedAt: string;
  endedAt: string;
  badgeDto: BadgeDto | null;
}

export interface UserChallengeDto {
  userChallengeId: number;
  userId: number;
  challengeDto: ChallengeDto;
  progressValue: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  percent: number; // 백엔드에서 계산해서 준 퍼센트
  remainingDays: number; // 백엔드에서 계산해서 준 D-Day
}
