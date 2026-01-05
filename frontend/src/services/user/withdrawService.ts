import { api } from "@/services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * LOCAL 계정: 비밀번호 필수
 * SOCIAL 계정: body 없음
 */
type WithdrawBody =
    | { password: string }
    | undefined;

export async function withdrawUser(body?: WithdrawBody) {
    await api.post("/api/users/me/withdraw", body ?? {});
}
