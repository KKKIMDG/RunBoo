import React, { FC } from 'react';
import { TouchableOpacity, Text } from 'react-native';

const PrimaryButton: FC<{ title: string; onPress?: () => void }> = ({ title, onPress }) => (
  <TouchableOpacity onPress={onPress} style={{ padding: 10, backgroundColor: '#007aff', borderRadius: 6 }}>
    <Text style={{ color: 'white', fontWeight: '600' }}>{title}</Text>
  </TouchableOpacity>
);

export default PrimaryButton;
