/**
 * ISO 날짜 문자열을 상대 시간 문자열로 변환
 * 예: 방금 전, 5분 전, 3시간 전, 어제, 2026.01.05
 */
export function formatRelativeTime(isoString: string): string {
    const now = new Date();
    const target = new Date(isoString);

    const diffMs = now.getTime() - target.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    // 미래 시간 방어
    if (diffSec < 0) {
        return formatDate(target);
    }

    // 1분 미만
    if (diffSec < 60) {
        return '방금 전';
    }

    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) {
        return `${diffMin}분 전`;
    }

    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) {
        return `${diffHour}시간 전`;
    }

    const diffDay = Math.floor(diffHour / 24);
    if (diffDay === 1) {
        return '어제';
    }

    // 그 이상은 날짜로
    return formatDate(target);
}

/**
 * 날짜를 YYYY.MM.DD 형태로 포맷
 */
function formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `${y}.${m}.${d}`;
}
