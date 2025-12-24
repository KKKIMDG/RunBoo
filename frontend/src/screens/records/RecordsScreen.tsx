import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import Segmented from "./components/Segmented";
import RecordCard from "./components/RecordCard";
import { fetchMyRecords } from "../../api/records";
import { DEFAULT_USER_ID } from "../../constants/env";
import type { RecordDto } from "../../types/record";

export default function RecordsScreen({ navigation }: any) {
    const [tab, setTab] = useState<"left" | "right">("left");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [data, setData] = useState<RecordDto[]>([]);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const userId = DEFAULT_USER_ID;

    async function load() {
        try {
            setErrorMsg(null);

            const records = await fetchMyRecords(userId);

            // ✅ 백엔드 실제 응답 확인용 로그
            console.log("📦 records from backend:", records);

            setData(records);
        } catch (e) {
            console.log("❌ records api error:", e);
            setErrorMsg("기록을 불러오지 못했어요. 네트워크/서버 상태를 확인해줘.");
            setData([]);
        }
    }

    useEffect(() => {
        (async () => {
            try {
                await load();
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const handleChangeTab = (v: "left" | "right") => {
        if (v === "right") {
            navigation.navigate("Stats");
            setTab("left");
            return;
        }
        setTab(v);
    };

    if (loading) {
        return (
            <View style={s.center}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={s.container}>
            <Text style={s.title}>기록</Text>
            <Text style={s.subTitle}>나의 러닝 기록</Text>

            <View style={{ marginTop: 12, marginBottom: 12 }}>
                <Segmented
                    leftLabel="기록"
                    rightLabel="통계"
                    value={tab}
                    onChange={handleChangeTab}
                />
            </View>

            {errorMsg && (
                <View style={{ paddingVertical: 10 }}>
                    <Text style={{ color: "#EF4444", fontWeight: "700" }}>
                        {errorMsg}
                    </Text>
                </View>
            )}

            <FlatList
                data={data}
                keyExtractor={(it) => String(it.id)}
                renderItem={({ item }) => <RecordCard item={item} />}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={async () => {
                            setRefreshing(true);
                            try {
                                await load();
                            } finally {
                                setRefreshing(false);
                            }
                        }}
                    />
                }
                ListEmptyComponent={
                    <View style={{ paddingTop: 40 }}>
                        <Text style={{ textAlign: "center", color: "#6B7280" }}>
                            아직 러닝 기록이 없어요.
                        </Text>
                    </View>
                }
                contentContainerStyle={{ paddingBottom: 24 }}
            />
        </View>
    );
}

const s = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 14,
        backgroundColor: "#F5F7FB",
    },
    title: { fontSize: 22, fontWeight: "900", color: "#111827" },
    subTitle: { marginTop: 4, color: "#6B7280", fontWeight: "600" },
    center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
