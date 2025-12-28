import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function BackButton() {
  const navigation = useNavigation();

  return (
    <TouchableOpacity 
      style={styles.button} 
      onPress={() => navigation.goBack()}
      activeOpacity={0.7}
    >
      <Ionicons name="arrow-back" size={24} color="#000" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    // 그림자 효과 (사진의 입체감 반영)
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});