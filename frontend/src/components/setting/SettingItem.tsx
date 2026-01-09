import React, { useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import { getStyles } from "./SettingItem.styles";

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

  /** 외부 스타일 주입 */
  style?: ViewStyle;

  /** link | switch | text | select | expand */
  type?: "link" | "switch" | "text" | "select" | "expand";

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

  /** expand */
  isOpen?: boolean;
  onToggleOpen?: () => void;

  /** link */
  onPress?: () => void;
}

/**
 * 커스텀 소형 스위치
 */
const CustomSmallSwitch = ({ active }: { active: boolean }) => {
  const moveAnim = useRef(new Animated.Value(active ? 1 : 0)).current;
  const colorScheme = useColorScheme() ?? "light";
  const styles = useMemo(() => getStyles(colorScheme), [colorScheme]);

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
        active ? styles.switchTrackOn : styles.switchTrackOff,
      ]}
    >
      <Animated.View
        style={[styles.switchThumb, { transform: [{ translateX }] }]}
      />
    </Animated.View>
  );
};

export default function SettingItem({
  icon,
  label,
  value,
  isLast,
  type = "link",
  isEnabled = false,
  disabled = false,
  style,
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

  const colorScheme = useColorScheme() ?? "light";
  const styles = useMemo(() => getStyles(colorScheme), [colorScheme]);

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
    outputRange: ["0deg", "180deg"],
  });

  const isDisabled = disabled === true;
  const Wrapper = type === "switch" ? View : TouchableOpacity;
  const showChevron = type === "select" || type === "expand";

  return (
    <View ref={itemRef}>
      <Wrapper
        style={[
          styles.container,
          !isLast && styles.borderBottom,
          isDisabled && styles.disabled,
          style,
        ]}
        {...(type !== "switch"
          ? {
              activeOpacity: 0.7,
              disabled: isDisabled,
              onPress: () => {
                if (isDisabled) return;

                if (type === "link") {
                  onPress?.();
                  return;
                }

                if (type === "select") {
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

                if (type === "expand") {
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
              color={isDisabled ? styles.iconDisabled.color : styles.icon.color}
              style={styles.icon}
            />
          )}
          <Text style={[styles.label, isDisabled && styles.labelDisabled]}>
            {label}
          </Text>
        </View>

        {/* 오른쪽 */}
        <View style={styles.rightContent}>
          {type === "switch" ? (
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
                <Text
                  style={[styles.valueText, isDisabled && styles.valueDisabled]}
                >
                  {value}
                </Text>
              )}

              {showChevron && (
                <Animated.View style={{ transform: [{ rotate }] }}>
                  <Ionicons
                    name="chevron-down"
                    size={18}
                    color={
                      isDisabled
                        ? styles.iconDisabled.color
                        : styles.chevron.color
                    }
                  />
                </Animated.View>
              )}

              {type === "link" && (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={
                    isDisabled
                      ? styles.iconDisabled.color
                      : styles.chevron.color
                  }
                />
              )}
            </>
          )}
        </View>
      </Wrapper>
    </View>
  );
}
