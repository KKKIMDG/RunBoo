import polyline from '@mapbox/polyline';

// 좌표 타입 정의 (다른 파일에서도 쓰니까 export)
export interface Coordinate {
    latitude: number;
    longitude: number;
}

/**
 * 1. 하버사인 공식 (Haversine Formula)
 * - 지구는 둥글기 때문에 단순 뺄셈으로는 거리를 구할 수 없습니다.
 * - 두 위도/경도 좌표 사이의 실제 거리(m)를 구하는 공식입니다.
 */
export const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if ((lat1 === lat2) && (lon1 === lon2)) return 0;

    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;

    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    if (dist > 1) dist = 1;
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    dist = dist * 1.609344 * 1000; // 미터(m) 단위로 변환

    return dist;
};

/**
 * 2. 경로 압축 (Polyline Encoding)
 * - 수백 개의 좌표 배열을 긴 문자열 하나로 압축해줍니다.
 * - DB 용량을 아끼기 위해 필수입니다.
 */
export const encodePath = (coordinates: Coordinate[]): string => {
    // mapbox 라이브러리는 [latitude, longitude] 배열의 배열을 원함
    const points = coordinates.map(c => [c.latitude, c.longitude] as [number, number]);
    return polyline.encode(points);
};