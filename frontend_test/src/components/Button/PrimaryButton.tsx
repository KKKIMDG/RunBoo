// components/Button
// - PrimaryButton.tsx: 재사용 가능한 프라이머리 버튼 컴포넌트.
// - index.ts: 컴포넌트의 기본 re-export를 포함.
import React, { FC } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

const PrimaryButton: FC<{ title: string; onPress?: () => void }> = ({ title, onPress }) => {
  const backgroundColor = useThemeColor({}, 'primary');
  const color = useThemeColor({}, 'primaryButtonText');

  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 10, backgroundColor, borderRadius: 6 }}>
      <Text style={{ color, fontWeight: '600' }}>{title}</Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;
