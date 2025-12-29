// src/screens/TierResult/TierResult.constants.ts
import { ColorValue } from 'react-native';

export type TierKey =
  | 'barefoot'
  | 'straw'
  | 'slipper'
  | 'rubber'
  | 'shoes'
  | 'crystal';


export const TIER_ID_MAP: Record<number, TierKey> = {
  1: 'barefoot',
  2: 'straw',
  3: 'slipper',
  4: 'rubber',
  5: 'shoes',
  6: 'crystal',
};

export type TierTheme = {
  label: string; // 화면 표시용 한글
  colors: readonly [ColorValue, ColorValue, ...ColorValue[]];
  point: string;
};

export const TIER_THEMES: Record<TierKey, TierTheme> = {
  barefoot: {
    label: '맨발',
    colors: ['#F3E5D8', '#E2CFC0'],
    point: '#8D6E63',
  },
  straw: {
    label: '짚신',
    colors: ['#FFF9C4', '#F0E68C'],
    point: '#FBC02D',
  },
  slipper: {
    label: '슬리퍼',
    colors: ['#F5F5F5', '#E0E0E0'],
    point: '#9E9E9E',
  },
  rubber: {
    label: '고무신',
    colors: ['#2C2C2C', '#0A0A0A'],
    point: '#BDBDBD',
  },
  shoes: {
    label: '구두',
    colors: ['#FFD54F', '#FFB300'],
    point: '#FFA000',
  },
  crystal: {
    label: '크리스탈 운동화',
    colors: ['#B3E5FC', '#4FC3F7'],
    point: '#03A9F4',
  },
};