import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
} from 'react-native';

// 위에서 만든 컴포넌트 불러오기
import CourseCard, { CourseType } from '../../components/CourseCard';
import FilterChip from '../../components/FilterChip';

// 더미 데이터 (나중에 API로 교체될 부분)
const COURSES: CourseType[] = [
    {
        id: 1,
        title: '올림픽 공원',
        address: '서울 송파구 올림픽로 424',
        distance: '5.2 km',
        imageUrl: 'https://images.unsplash.com/photo-1596423735880-bf9260655d04?q=80&w=2940&auto=format&fit=crop',
        isSaved: true,
    },
    {
        id: 2,
        title: '중랑천',
        address: '서울 노원구 상계동',
        distance: '4.2 km',
        imageUrl: 'https://images.unsplash.com/photo-1533235651926-d24939762699?q=80&w=2940&auto=format&fit=crop',
        isSaved: false,
    },
    {
        id: 3,
        title: '남산 둘레길',
        address: '서울 용산구 남산공원길',
        distance: '7.0 km',
        imageUrl: 'https://images.unsplash.com/photo-1536257104079-aa99c6460a5a?q=80&w=2940&auto=format&fit=crop',
        isSaved: false,
    },
];

export default function CourseScreen() {
    const [activeFilter, setActiveFilter] = useState('UNDER_5K');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

            {/* 본문 스크롤 영역 */}
            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* 헤더 영역 */}
                <View style={styles.header}>
                    <Text style={styles.subHeader}>HOT PLACES</Text>
                    <Text style={styles.mainHeader}>코스 추천</Text>
                </View>

                {/* 필터 버튼 영역 */}
                <View style={styles.filterContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <FilterChip
                            label="5km 미만"
                            isActive={activeFilter === 'UNDER_5K'}
                            onPress={() => setActiveFilter('UNDER_5K')}
                        />
                        <FilterChip
                            label="5km 이상"
                            isActive={activeFilter === 'OVER_5K'}
                            onPress={() => setActiveFilter('OVER_5K')}
                        />
                        <FilterChip
                            label="❤ 저장"
                            isActive={activeFilter === 'SAVED'}
                            onPress={() => setActiveFilter('SAVED')}
                        />
                    </ScrollView>
                </View>

                {/* 코스 리스트 영역 */}
                <View style={styles.courseList}>
                    {COURSES.map((course) => (
                        <CourseCard key={course.id} course={course} />
                    ))}
                </View>
            </ScrollView>

            {/* 하단 내비게이션 바 (디자인 시안용, 실제로는 Navigation 라이브러리 사용 권장) */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Text style={styles.navIcon}>🏠</Text>
                    <Text style={styles.navText}>홈</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Text style={[styles.navIcon, { color: 'black' }]}>🏃</Text>
                    <Text style={[styles.navText, { color: 'black', fontWeight: 'bold' }]}>코스</Text>
                    <View style={styles.activeIndicator} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Text style={styles.navIcon}>🏆</Text>
                    <Text style={styles.navText}>도전</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Text style={styles.navIcon}>📊</Text>
                    <Text style={styles.navText}>통계</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingBottom: 100, // 하단 탭바에 가려지지 않게 여백 줌
    },
    header: {
        paddingHorizontal: 24,
        marginTop: 20,
        marginBottom: 20,
    },
    subHeader: {
        fontSize: 12,
        color: '#868E96',
        fontWeight: '600',
        marginBottom: 4,
        letterSpacing: 1,
    },
    mainHeader: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
    },
    filterContainer: {
        paddingHorizontal: 24,
        marginBottom: 24,
        flexDirection: 'row',
    },
    courseList: {
        paddingHorizontal: 24,
    },
    // 하단 탭바 스타일
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: '#FFF',
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#E9ECEF',
        paddingBottom: 20, // 아이폰 홈 바 영역 대응
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flex: 1,
    },
    navIcon: {
        fontSize: 20,
        marginBottom: 4,
        color: '#868E96',
    },
    navText: {
        fontSize: 10,
        color: '#868E96',
    },
    activeIndicator: {
        position: 'absolute',
        top: 0,
        width: 30,
        height: 3,
        backgroundColor: '#000',
        borderBottomLeftRadius: 4,
        borderBottomRightRadius: 4,
    },
});