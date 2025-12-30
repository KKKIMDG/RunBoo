//frontend/src/screens/records/components/format.ts

export function formatKm(distanceM: number) {
    const km = distanceM / 1000;
    return `${km.toFixed(1)} km`;
}

export function formatDurationFromRange(startIso: string, endIso: string) {
    const start = new Date(startIso);
    const end = new Date(endIso);

    if (!startIso || !endIso || isNaN(start.getTime()) || isNaN(end.getTime())) return "-";

    const sec = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
    return formatDuration(sec);
}

export function formatDurationSeconds(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatPace(avgPaceSecPerKm: number) {
    if (!Number.isFinite(avgPaceSecPerKm) || avgPaceSecPerKm <= 0) return "-";

    const totalSec = Math.floor(avgPaceSecPerKm);
    const mm = Math.floor(totalSec / 60);
    const ss = totalSec % 60;

    return `${mm}:${String(ss).padStart(2, "0")} /km`;
}

export function formatDate(iso: string) {
    const d = new Date(iso);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}.${mm}.${dd}`;
}

export function formatTimeRange(startIso: string, endIso: string) {
    const start = new Date(startIso);
    const end = new Date(endIso);

    const hhmm = (x: Date) =>
        `${String(x.getHours()).padStart(2, "0")}:${String(x.getMinutes()).padStart(2, "0")}`;

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "";
    return `${hhmm(start)} ~ ${hhmm(end)}`;
}

export function formatDuration(durationSec: number) {
    if (!Number.isFinite(durationSec) || durationSec < 0) return "-";

    const total = Math.floor(durationSec);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    if (h > 0) return `${h}시간 ${m}분 ${s}초`;
    return `${m}분 ${s}초`;
}
