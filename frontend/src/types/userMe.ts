export type SocialProvider = "LOCAL" | "KAKAO" | "GOOGLE";

export interface UserMe {
    userId: number;
    email: string;
    nickname: string;
    profileImageUrl: string | null;
    provider: SocialProvider;
}