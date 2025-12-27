// components/StatBox.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { styles } from '../screens/running/RunningScreen.styles'; // 위에서 만든 스타일 임포트

interface StatBoxProps {
    icon: React.ReactNode; // SVG 아이콘 컴포넌트 받기
    label: string;         // '시간', '거리', '페이스'
    value: string;         // '00:00:22' 등
    unit?: string;         // 'km', '/km' (옵션)
    highlight?: boolean;   // 색상 강조 여부
}

export function StatBox({ icon, label, value, unit, highlight }: StatBoxProps) {
    return (
        <View style={styles.statBox}>
            {/* 라벨 + 아이콘 */}
            <View style={styles.statHeader}>
                {icon}
                <Text style={styles.statLabel}>{label}</Text>
            </View>

            {/* 값 출력 */}
            <Text style={[styles.statValue, highlight && styles.statValueHighlight]}>
                {value}
            </Text>

            {/* 단위가 있으면 출력 */}
            {unit && <Text style={styles.statUnit}>{unit}</Text>}
        </View>
    );
}