import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';

interface FilterChipProps {
    label: string;
    isActive: boolean;
    onPress: () => void;
    scheme: 'light' | 'dark';
}

export default function FilterChip({ label, isActive, onPress, scheme }: FilterChipProps) {
    const styles = getStyles(scheme);
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

const getStyles = (scheme: 'light' | 'dark') => StyleSheet.create({
    filterChip: {
        backgroundColor: Colors[scheme].card,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Colors[scheme].secondaryBackground,
        marginRight: 8,
    },
    filterChipActive: {
        backgroundColor: Colors[scheme].primary,
        borderColor: Colors[scheme].primary,
    },
    filterText: {
        fontSize: 14,
        color: Colors[scheme].icon,
        fontWeight: 'bold',
    },
    filterTextActive: {
        color: Colors[scheme].background,
    },
});