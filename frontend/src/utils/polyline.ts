/** 기록 페이지에서 기록 상세 보기를 위해 구현 */

export type LatLng = { latitude: number; longitude: number };

/**
 * Google Encoded Polyline Algorithm Format 디코더
 * - 실패하면 throw
 */

export function decodePolyline(encoded: string): LatLng[] {
    if (!encoded || typeof encoded !== "string") return [];

    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    const coordinates: LatLng[] = [];

    while (index < len) {
        let result = 0;
        let shift = 0;
        let b: number;

        // latitude
        do {
            b = encoded.charCodeAt(index++) - 63;
            if (Number.isNaN(b)) throw new Error("Invalid polyline (NaN char)");
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlat = (result & 1) ? ~(result >> 1) : result >> 1;
        lat += dlat;

        // longitude
        result = 0;
        shift = 0;
        do {
            b = encoded.charCodeAt(index++) - 63;
            if (Number.isNaN(b)) throw new Error("Invalid polyline (NaN char)");
            result |= (b & 0x1f) << shift;
            shift += 5;
        } while (b >= 0x20);

        const dlng = (result & 1) ? ~(result >> 1) : result >> 1;
        lng += dlng;

        coordinates.push({
            latitude: lat / 1e5,
            longitude: lng / 1e5,
        });
    }

    // 좌표 유효성 최소 체크
    const cleaned = coordinates.filter(
        (c) =>
            Number.isFinite(c.latitude) &&
            Number.isFinite(c.longitude) &&
            Math.abs(c.latitude) <= 90 &&
            Math.abs(c.longitude) <= 180
    );

    // 너무 적으면(0~1개) 경로로 의미 없어서 빈 배열 처리
    return cleaned.length >= 2 ? cleaned : [];
}
