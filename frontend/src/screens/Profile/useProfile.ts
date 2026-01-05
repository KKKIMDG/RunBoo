// screens/Profile/hooks/useProfile.ts
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";

import { useUserMe } from "@/contexts/UserMeContext";
import { useBadge } from "@/screens/Badge/useBadge";
import { useGrass } from "@/screens/Profile/useGrass";

import {
    updateMyNickname,
    updateMyProfileImage,
} from "@/services/user/userService";
import { fetchCurrentRunningStreak } from "@/services/record/recordsService";

/* =======================
   날짜 유틸 (로컬 기준)
======================= */
function toYmdLocal(d: Date) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

export function useProfile(weeks: number = 12) {
    /* =======================
       기본 데이터
    ======================= */
    const { userMe, loading: meLoading, refetch } = useUserMe();
    const { badges, badgeCount, loading: badgeLoading } = useBadge();
    const { data: grassData, levelMap, loading: grassLoading } = useGrass(weeks);

    /* =======================
       프로필 상태
    ======================= */
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [nicknameInput, setNicknameInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);

    /* =======================
       연속 러닝
    ======================= */
    const [streak, setStreak] = useState<number | null>(null);
    const [streakLoading, setStreakLoading] = useState(false);

    /* =======================
       파생 데이터
    ======================= */
    const profileImageSource =
        typeof userMe?.profileImageUrl === "string" &&
        userMe.profileImageUrl.length > 0
            ? { uri: userMe.profileImageUrl }
            : require("@/assets/images/runboo.png");

    /* =======================
       effect
    ======================= */
    useEffect(() => {
        if (userMe?.nickname) {
            setNicknameInput(userMe.nickname);
        }
    }, [userMe?.nickname]);

    useEffect(() => {
        if (!userMe) return;

        const loadStreak = async () => {
            try {
                setStreakLoading(true);
                const value = await fetchCurrentRunningStreak();
                setStreak(value);
            } finally {
                setStreakLoading(false);
            }
        };

        loadStreak();
    }, [userMe]);

    /* =======================
       닉네임 저장
    ======================= */
    const saveNickname = async () => {
        if (!nicknameInput.trim()) return;

        try {
            setSaving(true);
            await updateMyNickname(nicknameInput.trim());
            await refetch();
            setIsEditingNickname(false);
        } finally {
            setSaving(false);
        }
    };

    /* =======================
       이미지 선택
    ======================= */
    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) return null;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (result.canceled) return null;
        return result.assets[0];
    };

    /* =======================
       이미지 업로드
    ======================= */
    const uploadProfileImage = async (
        image: ImagePicker.ImagePickerAsset
    ) => {
        if (!userMe?.userId) throw new Error("사용자 정보 없음");

        const filePath = `${userMe.userId}_${Date.now()}.jpg`;
        const buffer = await (await fetch(image.uri)).arrayBuffer();

        await supabase.storage.from("profile-images").upload(filePath, buffer, {
            upsert: true,
            contentType: image.mimeType ?? "image/jpeg",
        });

        const { data } = supabase.storage
            .from("profile-images")
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    /* =======================
       프로필 이미지 변경
    ======================= */
    const changeProfileImage = async () => {
        if (!userMe) return;

        const image = await pickImage();
        if (!image) return;

        try {
            setSaving(true);
            setImageLoading(true);

            const imageUrl = await uploadProfileImage(image);
            await updateMyProfileImage(imageUrl);
            await refetch();
        } finally {
            setSaving(false);
            setImageLoading(false);
        }
    };

    /* =======================
       잔디 계산 (핵심 수정)
       - UTC 완전 제거
       - 로컬 YYYY-MM-DD만 사용
    ======================= */
    const buildGrassColumns12Weeks = (
        startDate: string,
        endDate: string
    ) => {
        const start = new Date(startDate + "T00:00:00");
        const end = new Date(endDate + "T23:59:59"); // 오늘 포함 보장
        const columns: (string | null)[][] = [];

        for (let w = 0; w < weeks; w++) {
            const col: (string | null)[] = [];

            for (let d = 0; d < 7; d++) {
                const cur = new Date(start);
                cur.setDate(start.getDate() + w * 7 + d);

                if (cur > end) {
                    col.push(null);
                } else {
                    col.push(toYmdLocal(cur)); // ✅ 로컬 기준 날짜
                }
            }

            columns.push(col);
        }

        return columns;
    };

    /* =======================
       반환
    ======================= */
    return {
        /* user */
        userMe,
        meLoading,
        profileImageSource,

        /* nickname */
        isEditingNickname,
        setIsEditingNickname,
        nicknameInput,
        setNicknameInput,
        saveNickname,

        /* image */
        changeProfileImage,
        imageLoading,

        /* badge */
        badges,
        badgeCount,
        badgeLoading,

        /* streak */
        streak,
        streakLoading,

        /* grass */
        grassData,
        levelMap,
        grassLoading,
        buildGrassColumns12Weeks,

        /* common */
        saving,
    };
}
