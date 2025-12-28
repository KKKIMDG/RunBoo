// src/screens/RunningScreen/RunningScreen.tsx

import React from 'react';
import { View, Text } from 'react-native';

// ⚠️ 경로 확인: styles와 StatBox 파일 위치가 실제 프로젝트와 맞는지 꼭 확인하세요!
import { styles } from './RunningScreen.styles';
import { StatBox } from '../../components/StatBox';

// ✅ SVG 파일 import 대신 Expo 아이콘 라이브러리를 사용합니다.
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

export function RunningScreen() {
    return (
        <View style={styles.root}>

            {/* 1. 상단 헤더 */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTag}>
                    <View style={styles.dot} />
                    <Text style={styles.headerText}>러닝 중</Text>
                </View>
                <View style={styles.iconButton}>
                    {/* 설정 아이콘 (기존 IconSetting 대체) */}
                    <Ionicons name="settings-outline" size={24} color="black" />
                </View>
            </View>

            {/* 2. 기록 정보 (StatBox 컴포넌트 재사용) */}
            <View style={styles.statsContainer}>
                <StatBox
                    // 시계 아이콘 (기존 IconTime 대체)
                    icon={<Ionicons name="time-outline" size={20} color="#868E96" />}
                    label="시간"
                    value="00:00:22"
                />
                <StatBox
                    // 거리/지도 아이콘 (기존 IconDistance 대체)
                    icon={<MaterialCommunityIcons name="map-marker-distance" size={20} color="#868E96" />}
                    label="거리"
                    value="0.04"
                    unit="km"
                    highlight={true} // 거리 텍스트 파란색 강조
                />
                <StatBox
                    // 속도/페이스 아이콘 (기존 IconPace 대체)
                    icon={<Ionicons name="speedometer-outline" size={20} color="#868E96" />}
                    label="페이스"
                    value="8'19"
                    unit='"/km'
                />
            </View>

            {/* 3. 페이스 변화 (그래프 영역) */}
            <View style={styles.chartContainer}>
                <View style={styles.chartTitle}>
                    {/* 차트 아이콘 (기존 IconChart 대체) */}
                    <Ionicons name="stats-chart" size={16} color="black" />
                    <Text style={styles.chartTitleText}>페이스 변화</Text>
                </View>

                <View style={styles.chartPlaceholder}>
                    {/* 기존 VectorChart.svg가 없으므로 임시로 텍스트/박스로 대체했습니다.
                       나중에 'react-native-chart-kit' 같은 라이브러리로 실제 그래프를 그리시면 됩니다.
                    */}
                    <View style={{
                        flex: 1,
                        width: '100%',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: '#F1F3F5',
                        borderRadius: 8
                    }}>
                        <MaterialCommunityIcons name="chart-line-variant" size={40} color="#CED4DA" />
                        <Text style={{ color: '#868E96', fontSize: 12, marginTop: 4 }}>그래프 영역</Text>
                    </View>
                </View>

                <View style={styles.chartFooter}>
                    <Text style={styles.chartFooterText}>시작</Text>
                    <Text style={styles.chartFooterText}>현재 페이스: 8'19"/km</Text>
                </View>
            </View>

            {/* 4. 지도 영역 (남은 공간) */}
            <View style={styles.mapContainer}>
                {/* 실제 MapView 컴포넌트가 들어갈 자리 */}
                <Text style={{ color: '#888' }}>카카오맵 영역</Text>
            </View>

            {/* 5. 하단 컨트롤 버튼 */}
            <View style={styles.controlBar}>
                <View style={styles.controlButton}>
                    {/* 일시정지 아이콘 (기존 IconPause 대체) */}
                    <Ionicons name="pause" size={30} color="black" />
                </View>
                <View style={styles.controlButton}>
                    {/* 정지 아이콘 (기존 IconStop 대체) */}
                    <Ionicons name="stop" size={30} color="black" />
                </View>
            </View>

        </View>
    );
}