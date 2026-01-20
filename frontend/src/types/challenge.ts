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
  progressValue: number;
  status: string;
  startedAt: string;
  completedAt: string | null;
  badgeId: number;
  badgeName: string;
  badgeIconUrl: string;
  challengeId: number;
  title: string;
  description: string;
  level: number;
  targetType: string;
  targetValue: number;
}
