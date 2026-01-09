import React, {useMemo} from 'react';
import {TouchableOpacity, StyleSheet, Platform, useColorScheme} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import {getStyles} from "@/components/ui/backButton.styles";

export default function BackButton() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme() ?? "light";

  const styles = useMemo(() => {
    return getStyles(colorScheme);
  }, [colorScheme]);
  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.goBack()}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" style={styles.icon} />
    </TouchableOpacity>
  );
}

