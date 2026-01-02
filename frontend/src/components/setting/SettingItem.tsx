import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/** select 옵션 타입 */
interface SelectOption<T = any> {
  label: string;
  value: T;
}

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  isLast?: boolean;

  /** link | switch | text | select */
  type?: 'link' | 'switch' | 'text' | 'select';

  /** switch */
  isEnabled?: boolean;
  onToggle?: (value: boolean) => void;

  /** select */
  options?: SelectOption[];
  onSelect?: (value: any) => void;

  /** link */
  onPress?: () => void;
}

/** 커스텀 스위치 */
const CustomSmallSwitch = ({
                             active,
                             onToggle,
                           }: {
  active: boolean;
  onToggle: (v: boolean) => void;
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
      <TouchableOpacity activeOpacity={0.8} onPress={() => onToggle(!active)}>
        <Animated.View
            style={[
              styles.switchTrack,
              { backgroundColor: active ? '#2E3D6E' : '#E9ECEF' },
            ]}
        >
          <Animated.View
              style={[styles.switchThumb, { transform: [{ translateX }] }]}
          />
        </Animated.View>
      </TouchableOpacity>
  );
};

export default function SettingItem({
                                      icon,
                                      label,
                                      value,
                                      isLast,
                                      type = 'link',
                                      isEnabled = false,
                                      onToggle,
                                      onPress,
                                      options,
                                      onSelect,
                                    }: SettingItemProps) {
  /** select 클릭 시 */
  const handleSelectPress = () => {
    if (!options || !onSelect) return;

    Alert.alert(
        label,
        '',
        options.map(opt => ({
          text: opt.label,
          onPress: () => onSelect(opt.value),
        })),
        { cancelable: true }
    );
  };

  return (
      <TouchableOpacity
          style={[styles.container, !isLast && styles.borderBottom]}
          activeOpacity={0.7}
          onPress={
            type === 'select'
                ? handleSelectPress
                : onPress
          }
          disabled={type === 'text' || type === 'switch'}
      >
        <View style={styles.leftContent}>
          <Ionicons
              name={icon}
              size={20}
              color="#868E96"
              style={styles.icon}
          />
          <Text style={styles.label}>{label}</Text>
        </View>

        <View style={styles.rightContent}>
          {type === 'switch' ? (
              <CustomSmallSwitch
                  active={isEnabled}
                  onToggle={onToggle || (() => {})}
              />
          ) : (
              <>
                {value && <Text style={styles.valueText}>{value}</Text>}

                {(type === 'link' || type === 'select') && (
                    <Ionicons
                        name={type === 'select' ? 'chevron-down' : 'chevron-forward'}
                        size={18}
                        color="#ADB5BD"
                    />
                )}
              </>
          )}
        </View>
      </TouchableOpacity>
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
  icon: { marginRight: 12 },
  label: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 14,
    color: '#ADB5BD',
    marginRight: 4,
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
