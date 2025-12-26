export function formatKm(distanceM: number) {
    const km = distanceM / 1000;
    return `${km.toFixed(1)} km`;
}

export function formatDurationFromRange(startIso: string, endIso: string) {
    const start = new Date(startIso);
    const end = new Date(endIso);

    // 방어: end가 없거나 파싱 실패하면 "0:00"
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "0:00";

    const diffSec = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
    return formatDurationSeconds(diffSec);
}

export function formatDurationSeconds(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;

    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatPace(avgPaceSecPerKm: number) {
    const pace = Math.max(0, Math.floor(avgPaceSecPerKm)); // 방어
    const m = Math.floor(pace / 60);
    const s = pace % 60;
    return `${m}'${String(s).padStart(2, "0")}''/km`;
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

export function formatDuration(sec: number) {
    return formatDurationSeconds(sec);
}
