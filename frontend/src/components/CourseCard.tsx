import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

// 나중에 API 데이터 타입과 맞추시면 됩니다.
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
    return (
        <TouchableOpacity style={styles.card} activeOpacity={0.9}>
            {/* 배경 이미지 */}
            <Image source={{ uri: course.imageUrl }} style={styles.cardImage} />

            {/* 찜하기 배지 (저장된 경우만 표시) */}
            {course.isSaved && (
                <View style={styles.savedIconBadge}>
                    <Text style={styles.starIcon}>⭐</Text>
                </View>
            )}

            {/* 하단 정보 영역 */}
            <View style={styles.cardContent}>
                <View style={styles.textInfo}>
                    <Text style={styles.cardTitle}>{course.title}</Text>
                    <View style={styles.row}>
                        <Text style={styles.locationIcon}>📍</Text>
                        <Text style={styles.cardAddress}>{course.address}</Text>
                    </View>
                </View>

                <View style={styles.distanceBadge}>
                    <Text style={styles.distanceLabel}>거리</Text>
                    <Text style={styles.distanceValue}>{course.distance}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        marginBottom: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        // 그림자 설정 (iOS & Android)
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover',
    },
    savedIconBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 6,
        borderRadius: 20,
        zIndex: 1,
    },
    starIcon: {
        fontSize: 14,
    },
    cardContent: {
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textInfo: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationIcon: {
        fontSize: 12,
        marginRight: 4,
    },
    cardAddress: {
        fontSize: 13,
        color: '#868E96',
    },
    distanceBadge: {
        alignItems: 'center',
        paddingLeft: 10,
    },
    distanceLabel: {
        fontSize: 10,
        color: '#868E96',
        marginBottom: 2,
    },
    distanceValue: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
});