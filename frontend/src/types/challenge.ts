export interface Badge {
  // BadgeDto -> Badge
  badgeId: number;
  name: string;
  description: string;
  iconUrl: string;
  difficulty: string;
}

export interface Challenge {
  challengeId: number;
  title: string;
  description: string;
  difficulty: string;
  targetType: string;
  targetValue: string;
  startedAt: string;
  endedAt: string;
  badge: Badge | null; // badgeDto -> badge
}

export interface UserChallengeDto {
  userChallengeId: number;
  userId: number;
  challenge: Challenge;
  progressValue: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  percentage: number; // percent -> percentage
  remainingDays: number;
}
