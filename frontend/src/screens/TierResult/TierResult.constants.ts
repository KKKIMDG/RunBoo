// src/screens/TierResult/TierResult.constants.ts
import { ColorValue } from 'react-native';

export type TierTheme = {
  colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
  point: string;
};

export const TIER_THEMES: Record<string, TierTheme> = {
  '맨발': { colors: ['#F3E5D8', '#E2CFC0'], point: '#8D6E63' },
  '짚신': { colors: ['#FFF9C4', '#F0E68C'], point: '#FBC02D' },
  '슬리퍼': { colors: ['#F5F5F5', '#E0E0E0'], point: '#9E9E9E' },
  '고무신': { colors: ['#2C2C2C', '#0A0A0A'], point: '#BDBDBD' },
  '구두': { colors: ['#FFD54F', '#FFB300'], point: '#FFA000' },
  '크리스탈 운동화': { colors: ['#B3E5FC', '#4FC3F7'], point: '#03A9F4' },
};