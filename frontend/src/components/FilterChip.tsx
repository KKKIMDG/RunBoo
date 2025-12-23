import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface FilterChipProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
}

export default function FilterChip({ label, isActive, onPress }: FilterChipProps) {
    return (
        <TouchableOpacity
            style={[styles.filterChip, isActive && styles.filterChipActive]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    filterChip: {
        backgroundColor: '#FFF',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: '#3A4A98',
        borderColor: '#3A4A98',
    },
    filterText: {
        fontSize: 14,
        color: '#868E96',
        fontWeight: 'bold',
    },
    filterTextActive: {
        color: '#FFF',
    },
});