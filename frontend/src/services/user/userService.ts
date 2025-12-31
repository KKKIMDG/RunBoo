import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "@env";

export const updateMyNickname = async (nickname: string) => {
    const token = await AsyncStorage.getItem("accessToken");

    const res = await fetch(
        `${API_BASE_URL}/api/users/me/nickname`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ nickname }),
        }
    );

    if (!res.ok) {
        throw new Error("닉네임 변경 실패");
    }
};
