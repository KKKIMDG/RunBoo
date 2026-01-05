// frontend/src/constants/TierImages.ts

export const TIER_IMAGES: Record<string, any> = {
  barefoot: require("@/assets/images/tiers/barefoot.png"),
  straw: require("@/assets/images/tiers/straw.png"),
  slipper: require("@/assets/images/tiers/slipper.png"),
  rubber: require("@/assets/images/tiers/rubber.png"),
  shoes: require("@/assets/images/tiers/shoes.png"),
  crystal: require("@/assets/images/tiers/crystal.png"),
};

/**
 * 서버에서 내려주는 티어 ID(Long/number)와
 * 위 이미지 객체의 키를 매핑합니다.
 */
export const TIER_ID_MAP: Record<number, any> = {
  // 5KM (ID 1~6)
  1: TIER_IMAGES.crystal,
  2: TIER_IMAGES.shoes,
  3: TIER_IMAGES.rubber,
  4: TIER_IMAGES.slipper,
  5: TIER_IMAGES.straw,
  6: TIER_IMAGES.barefoot,

  // 10KM (ID 7~12)
  7: TIER_IMAGES.crystal,
  8: TIER_IMAGES.shoes,
  9: TIER_IMAGES.rubber,
  10: TIER_IMAGES.slipper, // 아까 콘솔에 찍힌 5K의 10번은 사실 10K 데이터였을 가능성이 큽니다.
  11: TIER_IMAGES.straw,
  12: TIER_IMAGES.barefoot,
};
