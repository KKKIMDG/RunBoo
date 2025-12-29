export function formatPaceSecToText(avgPaceSec: number) {
    const m = Math.floor(avgPaceSec / 60);
    const s = avgPaceSec % 60;
    return `${m}'${String(s).padStart(2, "0")}"`;
}

export function formatKm(km: number) {
    return `${km.toFixed(1)} km`;
}
