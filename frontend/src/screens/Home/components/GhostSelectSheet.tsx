import React, { useMemo, useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator, useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import type { GhostProfileDto } from "@/types/ghost";
import type { RecordDto } from "@/types/record";
import { formatPaceSecToText, formatKm } from "@/screens/ghost/format";
import { fetchNationalRankingTop5 } from "@/services/record/recordsService";
import { getStyles } from "./GhostSelectSheet.styles";
import {useSettings} from "@/screens/Settings/useSettings"; // ✅ 외부 스타일 시트 임포트

type Props = {
  visible: boolean;
  scheme: "light" | "dark";
  loading: boolean;
  data: GhostProfileDto[];
  onClose: () => void;
  onSelect?: (gp: GhostProfileDto) => void;
  onRefresh?: () => void;
};

type GhostType =
  | "SELF_BEST"
  | "SELF_YESTERDAY"
  | "SELF_WEEKLY_AVG"
  | "RANKING_NATIONAL_1"
  | "RANKING_NATIONAL_2"
  | "RANKING_NATIONAL_3"
  | "RANKING_NATIONAL_4"
  | "RANKING_NATIONAL_5";

function normalizeType(t: string): GhostType | "UNKNOWN" {
  const x = String(t ?? "")
    .trim()
    .toUpperCase();
  if (x === "SELF_BEST") return "SELF_BEST";
  if (x === "SELF_YESTERDAY") return "SELF_YESTERDAY";
  if (x === "SELF_WEEKLY_AVG") return "SELF_WEEKLY_AVG";
  if (x === "RANKING_NATIONAL_1") return "RANKING_NATIONAL_1";
  if (x === "RANKING_NATIONAL_2") return "RANKING_NATIONAL_2";
  if (x === "RANKING_NATIONAL_3") return "RANKING_NATIONAL_3";
  if (x === "RANKING_NATIONAL_4") return "RANKING_NATIONAL_4";
  if (x === "RANKING_NATIONAL_5") return "RANKING_NATIONAL_5";
  return "UNKNOWN";
}

type SlotType = GhostType;

type TabKey = "self" | "ranking";

type Row = {
  key: SlotType;
  slot: SlotType;
  title: string;
  profile: GhostProfileDto | null;
};

function getTitleBySlot(slot: SlotType) {
  if (slot === "SELF_BEST") return "내 최고 기록";
  if (slot === "SELF_YESTERDAY") return "직전 기록";
  if (slot === "SELF_WEEKLY_AVG") return "이번 주 평균";
  if (slot === "RANKING_NATIONAL_1") return "전국 1위";
  if (slot === "RANKING_NATIONAL_2") return "전국 2위";
  if (slot === "RANKING_NATIONAL_3") return "전국 3위";
  if (slot === "RANKING_NATIONAL_4") return "전국 4위";
  return "전국 5위";
}

function getIconBySlot(slot: SlotType): any {
  if (
    slot === "SELF_BEST" ||
    slot.startsWith("RANKING_NATIONAL_1") ||
    slot.startsWith("RANKING_NATIONAL_2") ||
    slot.startsWith("RANKING_NATIONAL_3")
  )
    return "trophy-outline";
  if (slot === "SELF_YESTERDAY") return "today-outline";
  if (slot === "SELF_WEEKLY_AVG") return "bar-chart-outline";
  return "medal-outline";
}

function safeDate10(iso: string) {
  if (!iso) return "-";
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[1]}.${m[2]}.${m[3]}`;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(d.getDate()).padStart(2, "0")}`;
}

function safeWeekRangeLabel(weekStartIso: string) {
  if (!weekStartIso) return "-";
  const start = new Date(weekStartIso);
  if (isNaN(start.getTime())) return "-";
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return `${start.getFullYear()}.${String(start.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(start.getDate()).padStart(
    2,
    "0"
  )} ~ ${end.getFullYear()}.${String(end.getMonth() + 1).padStart(
    2,
    "0"
  )}.${String(end.getDate()).padStart(2, "0")}`;
}

function hasAnyRanking(list: GhostProfileDto[]) {
  return (list ?? []).some((gp) =>
    normalizeType((gp as any)?.type).startsWith("RANKING_NATIONAL")
  );
}

function toRankingGhostProfiles(top: RecordDto[]): GhostProfileDto[] {
  return (top ?? []).slice(0, 5).map(
    (r: any, idx) =>
      ({
        id: -(1000 + idx + 1),
        runRecordId: r?.id ?? null,
        type: `RANKING_NATIONAL_${idx + 1}`,
        targetDistanceKm: Number(r?.distanceM ?? 0) / 1000,
        avgPace: Number(r?.avgPace ?? 0),
        createdAt: String(r?.startedAt ?? r?.createdAt ?? ""),
      } as any)
  );
}

export default function GhostSelectSheet({
  visible,
  loading,
  data,
  onClose,
  onSelect,
}: Props) {

  const { settings } = useSettings();
  const colorScheme = useColorScheme() ?? "light";
  const s = useMemo(() => {
    return getStyles(colorScheme, settings?.fontSize || "MEDIUM");
  }, [colorScheme, settings?.fontSize]);
  // const s = getStyles(scheme); // ✅ 외부 스타일 시트 참조
  const [tab, setTab] = useState<TabKey>("self");
  const [rankingLocalLoading, setRankingLocalLoading] = useState(false);
  const [rankingLocal, setRankingLocal] = useState<GhostProfileDto[]>([]);

  useEffect(() => {
    let alive = true;
    async function loadRanking() {
      if (!visible || tab !== "ranking") return;
      if (hasAnyRanking(data ?? [])) {
        if (alive) setRankingLocal([]);
        return;
      }
      if (rankingLocal.length > 0) return;
      try {
        if (alive) setRankingLocalLoading(true);
        const top5 = await fetchNationalRankingTop5();
        if (alive) setRankingLocal(toRankingGhostProfiles(top5));
      } finally {
        if (alive) setRankingLocalLoading(false);
      }
    }
    loadRanking();
    return () => {
      alive = false;
    };
  }, [visible, tab, data]);

  const mergedData = useMemo(() => {
    if (hasAnyRanking(data ?? [])) return data;
    if (rankingLocal.length === 0) return data;
    return [...data, ...rankingLocal];
  }, [data, rankingLocal]);

  const byType = useMemo(() => {
    const map = new Map<GhostType, GhostProfileDto>();
    for (const gp of mergedData ?? []) {
      const t = normalizeType((gp as any)?.type);
      if (t !== "UNKNOWN" && !map.has(t)) map.set(t, gp);
    }
    return map;
  }, [mergedData]);

  const pickOne = (t: GhostType) => byType.get(t) ?? null;

  const selfRows: Row[] = useMemo(
    () =>
      ["SELF_BEST", "SELF_YESTERDAY", "SELF_WEEKLY_AVG"].map((slot) => ({
        key: slot as SlotType,
        slot: slot as SlotType,
        title: getTitleBySlot(slot as SlotType),
        profile: pickOne(slot as SlotType),
      })),
    [byType]
  );

  const rankingRows: Row[] = useMemo(
    () =>
      [
        "RANKING_NATIONAL_1",
        "RANKING_NATIONAL_2",
        "RANKING_NATIONAL_3",
        "RANKING_NATIONAL_4",
        "RANKING_NATIONAL_5",
      ].map((slot) => ({
        key: slot as SlotType,
        slot: slot as SlotType,
        title: getTitleBySlot(slot as SlotType),
        profile: pickOne(slot as SlotType),
      })),
    [byType]
  );

  const rows = tab === "self" ? selfRows : rankingRows;
  const isBusy = loading || rankingLocalLoading;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={s.backdrop}>
        <TouchableOpacity
          style={s.backdropTouch}
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.headerTitle}>고스트 선택</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={s.tabRow}>
            <TouchableOpacity
              style={[s.tabPill, tab === "self" && s.tabPillActive]}
              onPress={() => setTab("self")}
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={tab === "self" ? "#fff" : s.tabText.color}
              />
              <Text style={[s.tabText, tab === "self" && s.tabTextActive]}>
                내 기록
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.tabPill, tab === "ranking" && s.tabPillActive]}
              onPress={() => setTab("ranking")}
            >
              <Ionicons
                name="people-outline"
                size={16}
                color={tab === "ranking" ? "#fff" : s.tabText.color}
              />
              <Text style={[s.tabText, tab === "ranking" && s.tabTextActive]}>
                랭킹
              </Text>
            </TouchableOpacity>
          </View>

          {isBusy ? (
            <View style={s.loadingBox}>
              <ActivityIndicator color={s.iconColor.color} />
            </View>
          ) : (
            <FlatList
              data={rows}
              keyExtractor={(i) => i.key}
              contentContainerStyle={s.listContent}
              renderItem={({ item }) => {
                const gp = item.profile;
                if (!gp) {
                  return (
                    <View style={[s.item, { opacity: 0.6 }]}>
                      <Ionicons
                        name={getIconBySlot(item.slot)}
                        size={18}
                        color={s.itemSub.color}
                      />
                      <View style={s.itemLeft}>
                        <Text style={s.itemTitle}>{item.title}</Text>
                        <Text style={s.itemSub}>아직 데이터가 없어요</Text>
                      </View>
                      <View style={s.itemRight}>
                        <Text style={s.itemTitle}>-</Text>
                        <Text style={s.itemSub}>-</Text>
                      </View>
                    </View>
                  );
                }
                const subText =
                  item.slot === "SELF_WEEKLY_AVG"
                    ? safeWeekRangeLabel(gp.createdAt)
                    : safeDate10(gp.createdAt);
                return (
                  <TouchableOpacity
                    style={s.item}
                    onPress={() => {
                      onClose?.();
                      onSelect?.(gp);
                    }}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name={getIconBySlot(item.slot)}
                      size={18}
                      color={s.iconColor.color}
                    />
                    <View style={s.itemLeft}>
                      <Text style={s.itemTitle}>{item.title}</Text>
                      <Text style={s.itemSub}>{subText}</Text>
                    </View>
                    <View style={s.itemRight}>
                      <Text style={s.itemTitle}>
                        {formatKm(gp.targetDistanceKm)}
                      </Text>
                      <Text style={s.itemSub}>
                        {formatPaceSecToText(gp.avgPace)}/km
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
