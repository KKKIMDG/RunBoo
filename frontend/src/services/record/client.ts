import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "../../constants/env";

export const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
});

console.log("🔥 AXIOS baseURL =", api.defaults.baseURL);

// ✅ 요청마다 토큰 자동 첨부
api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("accessToken"); // 네가 저장한 키 이름에 맞춰야 함
    if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ 디버그: 403이면 서버 메시지 확인
api.interceptors.response.use(
    (res) => res,
    (err) => {
        console.log("❌ AXIOS ERR status =", err?.response?.status);
        console.log("❌ AXIOS ERR data =", err?.response?.data);
        return Promise.reject(err);
    }
);
