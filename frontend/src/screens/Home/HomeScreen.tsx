// src/screens/HomeScreen.tsx
// - HomeScreen.tsx: 로그인 후 표시되는 메인 화면(플레이스홀더). 실제 콘텐츠 추가.
// - index.ts: 기본 export.

import React, { FC } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const HomeScreen: FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>환영합니다!</Text>
      <Text style={{ marginTop: 8 }}>메인 화면(placeholder)</Text>
      {onLogout && (
        <TouchableOpacity onPress={onLogout} style={{ marginTop: 20, padding: 10, backgroundColor: '#ff4444', borderRadius: 6 }}>
          <Text style={{ color: 'white' }}>로그아웃</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default HomeScreen;
