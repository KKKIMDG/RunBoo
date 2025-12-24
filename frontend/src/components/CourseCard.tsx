import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
// 1. .env에서 키 가져오기 (설정하신 환경 변수명과 일치해야 합니다)
// @ts-ignore (타입 선언 파일이 없으면 에러가 날 수 있어 추가합니다)
import { KAKAO_REST_API_KEY } from '@env';

export interface CourseType {
    id: number;
    title: string;
    address: string;
    distance: string;
    imageUrl: string;
    isSaved: boolean;
}

interface CourseCardProps {
    course: CourseType;
}

export default function CourseCard({ course }: CourseCardProps) {
    const placeholderMapImage = 'https://via.placeholder.com/400x200/A7C7E7/000000?text=Map+Loading';

    const isValidImage =
        course.imageUrl &&
        typeof course.imageUrl === 'string' &&
        course.imageUrl.includes('http');

    const mapUri = isValidImage ? course.imageUrl : placeholderMapImage;

    return (
        <View style={styles.card}>
            <Image
                source={{
                    uri: mapUri,
                    // 2. 인증 헤더 추가 (REST API 키 방식)
                    headers: {
                        Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`
                    }
                }}
                style={styles.image}
                key={mapUri}
            />

            <View style={styles.textContainer}>
                <View style={styles.headerRow}>
                    <Text style={styles.title} numberOfLines={1}>
                        {course.title}
                    </Text>
                    <Text style={styles.distance}>{course.distance}</Text>
                </View>

                <View style={styles.infoRow}>
                    <Text style={styles.address} numberOfLines={1}>
                        📍 {course.address}
                    </Text>
                    <Text style={styles.heart}>{course.isSaved ? '♥' : '♡'}</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 180,
        backgroundColor: '#E9ECEF', // 로딩 전 배경색
    },
    textContainer: { padding: 16 },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    title: { fontSize: 18, fontWeight: 'bold', color: '#111', flex: 1, marginRight: 10 },
    distance: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    address: { fontSize: 14, color: '#888', flex: 1 },
    heart: { fontSize: 20, color: '#FF6B6B' }
});