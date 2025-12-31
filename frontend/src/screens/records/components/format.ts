// frontend/src/screens/records/components/format.ts

export function formatKm(distanceM: number) {
    if (!Number.isFinite(distanceM) || distanceM <= 0) return "-";

    const km = distanceM / 1000;
    return `${km.toFixed(1)} km`;
}

function extractDate(iso: string) {
    if (!iso) return null;
    const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return null;
    return { yyyy: m[1], mm: m[2], dd: m[3] };
}

function extractTime(iso: string) {
    if (!iso) return null;
    const m = String(iso).match(/T(\d{2}):(\d{2})/);
    if (!m) return null;
    return { hh: m[1], mm: m[2] };
}

/* =========================
   날짜 표시 (YYYY.MM.DD)
 ========================= */
export function formatDate(iso: string) {
    const d = extractDate(iso);
    if (!d) return "-";
    return `${d.yyyy}.${d.mm}.${d.dd}`;
}

/* =========================
   시간 범위 (HH:mm ~ HH:mm)
 ========================= */
export function formatTimeRange(startIso: string, endIso: string) {
    const s = extractTime(startIso);
    const e = extractTime(endIso);
    if (!s || !e) return "";
    return `${s.hh}:${s.mm} ~ ${e.hh}:${e.mm}`;
}

/* =========================
   실제 러닝 시간 (초 → 문자열)
   ⚠️ 이건 "차이"이므로 Date 사용 OK
 ========================= */
export function formatDurationFromRange(startIso: string, endIso: string) {
    if (!startIso || !endIso) return "-";

    const start = new Date(startIso);
    const end = new Date(endIso);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "-";

    const sec = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
    return formatDuration(sec);
}

/* =========================
   페이스 (초/km)
 ========================= */
export function formatPace(avgPaceSecPerKm: number) {
    if (!Number.isFinite(avgPaceSecPerKm) || avgPaceSecPerKm <= 0) return "-";

    const totalSec = Math.floor(avgPaceSecPerKm);
    const mm = Math.floor(totalSec / 60);
    const ss = totalSec % 60;

    return `${mm}:${String(ss).padStart(2, "0")} /km`;
}

/* =========================
   시간 포맷 (초 → 분/초 or 시간/분/초)
 ========================= */
export function formatDuration(durationSec: number) {
    if (!Number.isFinite(durationSec) || durationSec <= 0) return "-";

    const total = Math.floor(durationSec);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    if (h > 0) return `${h}시간 ${m}분 ${s}초`;
    if (m > 0) return `${m}분 ${s}초`;
    return `${s}초`;
}

export function formatDurationSeconds(sec: number) {
    if (!Number.isFinite(sec) || sec <= 0) return "-";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}
