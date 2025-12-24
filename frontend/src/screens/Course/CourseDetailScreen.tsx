import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard'; // 주소 복사를 위해 추가
import { CourseService } from '../../services/CourseService';

export default function CourseDetailScreen({ route, navigation }: any) {
    const { courseId } = route.params || { courseId: 1 };
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDetail();
    }, [courseId]);

    const fetchDetail = async () => {
        const data = await CourseService.getCourseDetail(courseId);
        setCourse(data);
        setLoading(false);
    };

    const handleClose = () => {
        navigation.goBack();
    };

    // ★ 클립보드 복사 함수
    const handleCopyAddress = async () => {
        if (course?.address) {
            await Clipboard.setStringAsync(course.address);
            Alert.alert('복사 완료', '주소가 클립보드에 복사되었습니다.');
        }
    };

    if (loading) {
        return (
            <View style={styles.overlay}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    if (!course) {
        return (
            <View style={styles.overlay}>
                <View style={styles.popupContainer}>
                    <Text>코스 정보를 불러올 수 없습니다.</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <Text style={styles.closeButtonText}>닫기</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.overlay}>
            <View style={styles.popupContainer}>

                {/* 헤더 영역 */}
                <View style={styles.header}>
                    <View style={{flex: 1}}>
                        <Text style={styles.title} numberOfLines={1}>{course.name}</Text>
                        <Text style={styles.address} numberOfLines={1}>📍 {course.address}</Text>
                    </View>
                    <TouchableOpacity style={styles.closeIconButton} onPress={handleClose}>
                        <Text style={styles.closeIconText}>✕</Text>
                    </TouchableOpacity>
                </View>

                {/* ★ 지도 영역: 목록과 동일하게 이미지로 표시 */}
                <View style={styles.mapArea}>
                    <Image
                        source={{
                            uri: course.imageUrl,
                            headers: { Referer: 'http://localhost:8081' } // 카카오 정책 대응
                        }}
                        style={styles.mapImage}
                        resizeMode="cover"
                    />
                </View>

                {/* 상세 정보 요약 (선택 사항) */}
                <View style={styles.infoContent}>
                    <Text style={styles.distanceText}>총 거리: {course.lengthKm} km</Text>
                </View>

                {/* ★ 하단 버튼: 클릭 시 주소 복사 */}
                <TouchableOpacity style={styles.copyButton} onPress={handleCopyAddress}>
                    <Text style={styles.copyButtonText}>클립보드 복사 →</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    popupContainer: {
        backgroundColor: '#fff',
        width: '100%',
        maxHeight: '80%',
        borderRadius: 24,
        overflow: 'hidden',
    },
    header: {
        backgroundColor: '#2B3467',
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    address: {
        color: '#D1D5DB',
        fontSize: 13,
    },
    closeIconButton: {
        padding: 5,
    },
    closeIconText: {
        color: '#fff',
        fontSize: 24,
    },
    mapArea: {
        width: '100%',
        height: 250, // 지도 이미지 높이 고정
        backgroundColor: '#F3F4F6',
    },
    mapImage: {
        width: '100%',
        height: '100%',
    },
    infoContent: {
        padding: 20,
    },
    distanceText: {
        fontSize: 16,
        color: '#4B5563',
        fontWeight: '600',
    },
    copyButton: {
        backgroundColor: '#1F2937',
        padding: 18,
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 20,
        borderRadius: 12,
    },
    copyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: { marginTop: 20, padding: 10, backgroundColor: '#eee', borderRadius: 5 },
    closeButtonText: { color: '#333' }
});