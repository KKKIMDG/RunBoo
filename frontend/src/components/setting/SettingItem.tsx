import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * Select 옵션 타입
 */
interface SelectOption<T = any> {
    label: string;
    value: T;
}

interface SettingItemProps {
    icon?: keyof typeof Ionicons.glyphMap;
    label: string;
    value?: string;
    isLast?: boolean;
    disabled?: boolean;

    /** link | switch | text | select | expand */
    type?: 'link' | 'switch' | 'text' | 'select' | 'expand';

    /** switch */
    isEnabled?: boolean;
    onToggle?: (value: boolean) => void;

    /** select */
    options?: SelectOption[];
    onSelect?: (value: any) => void;
    onOpenSelect?: (params: {
        x: number;
        y: number;
        width: number;
        height: number;
        options: { label: string; value: any }[];
        onSelect: (v: any) => void;
    }) => void;
    isOpen?: boolean;
    onToggleOpen?: () => void;

    /** link */
    onPress?: () => void;
}

/**
 * 커스텀 소형 스위치
 */
const CustomSmallSwitch = ({
                               active,
                           }: {
    active: boolean;
}) => {
    const moveAnim = useRef(new Animated.Value(active ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(moveAnim, {
            toValue: active ? 1 : 0,
            duration: 200,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
    }, [active]);

    const translateX = moveAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [2, 14],
    });

    return (
        <Animated.View
            style={[
                styles.switchTrack,
                { backgroundColor: active ? '#2E3D6E' : '#E9ECEF' },
            ]}
        >
            <Animated.View
                style={[
                    styles.switchThumb,
                    { transform: [{ translateX }] },
                ]}
            />
        </Animated.View>
    );
};

export default function SettingItem({
                                        icon,
                                        label,
                                        value,
                                        isLast,
                                        type = 'link',
                                        isEnabled = false,
                                        disabled = false,
                                        onToggle,
                                        onPress,
                                        options,
                                        onSelect,
                                        onOpenSelect,
                                        isOpen,
                                        onToggleOpen,
                                    }: SettingItemProps) {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const itemRef = useRef<View>(null);

    useEffect(() => {
        Animated.timing(rotateAnim, {
            toValue: isOpen ? 1 : 0,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    }, [isOpen]);

    const rotate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const isDisabled = disabled === true;
    const Wrapper = type === 'switch' ? View : TouchableOpacity;
    const showChevron = type === 'select' || type === 'expand';

    const labelColor = isDisabled ? '#ADB5BD' : '#1F2937';
    const iconColor = isDisabled ? '#CED4DA' : '#868E96';
    const valueColor = isDisabled ? '#CED4DA' : '#ADB5BD';

    return (
        <View ref={itemRef}>
            <Wrapper
                style={[
                    styles.container,
                    !isLast && styles.borderBottom,
                    isDisabled && { opacity: 0.6 },
                ]}
                {...(type !== 'switch'
                    ? {
                        activeOpacity: 0.7,
                        disabled: isDisabled,
                        onPress: () => {
                            if (isDisabled) return;

                            if (type === 'link') {
                                onPress?.();
                                return;
                            }

                            if (type === 'select') {
                                if (!options || !onSelect || !onOpenSelect) return;

                                itemRef.current?.measureInWindow((x, y, width, height) => {
                                    onToggleOpen?.();
                                    onOpenSelect({
                                        x,
                                        y,
                                        width,
                                        height,
                                        options,
                                        onSelect,
                                    });
                                });
                                return;
                            }

                            if (type === 'expand') {
                                onToggleOpen?.();
                            }
                        },
                    }
                    : {})}
            >
                {/* 왼쪽 */}
                <View style={styles.leftContent}>
                    {icon && (
                        <Ionicons
                            name={icon}
                            size={20}
                            color={iconColor}
                            style={styles.icon}
                        />
                    )}
                    <Text style={[styles.label, { color: labelColor }]}>
                        {label}
                    </Text>
                </View>

                {/* 오른쪽 */}
                <View style={styles.rightContent}>
                    {type === 'switch' ? (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            disabled={isDisabled}
                            onPress={() => onToggle?.(!isEnabled)}
                            style={styles.switchHitArea}
                        >
                            <CustomSmallSwitch active={isEnabled} />
                        </TouchableOpacity>
                    ) : (
                        <>
                            {value && (
                                <Text style={[styles.valueText, { color: valueColor }]}>
                                    {value}
                                </Text>
                            )}

                            {showChevron && (
                                <Animated.View style={{ transform: [{ rotate }] }}>
                                    <Ionicons
                                        name="chevron-down"
                                        size={18}
                                        color={isDisabled ? '#CED4DA' : '#ADB5BD'}
                                    />
                                </Animated.View>
                            )}

                            {type === 'link' && (
                                <Ionicons
                                    name="chevron-forward"
                                    size={18}
                                    color={isDisabled ? '#CED4DA' : '#ADB5BD'}
                                />
                            )}
                        </>
                    )}
                </View>
            </Wrapper>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 56,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    leftContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 12,
    },
    label: {
        fontSize: 15,
        fontWeight: '500',
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueText: {
        fontSize: 14,
        marginRight: 4,
    },

    /** 스위치 터치 영역 */
    switchHitArea: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },

    switchTrack: {
        width: 32,
        height: 18,
        borderRadius: 10,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    switchThumb: {
        width: 13,
        height: 13,
        borderRadius: 6,
        backgroundColor: '#FFF',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
    },
});
