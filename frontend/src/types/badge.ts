export interface BadgeDto {
  badgeId: number;
  name: string;
  description: string;
  iconUrl: string;
  difficulty: string;
}

export interface UserBadgeDto {
  userBadgeId: number;
  userId: number;
  badgeId: number;
  name: string;
  description: string;
  iconUrl: string;
  acquiredAt: string;
}
