export type FontSizeSetting = "SMALL" | "MEDIUM" | "LARGE";

const FONT_SCALE: Record<FontSizeSetting, number> = {
    SMALL: 1,
    MEDIUM: 1.2,
    LARGE: 1.4,
};

export function scaleFont(
    baseSize: number,
    fontSize: FontSizeSetting
) {
    return Math.round(baseSize * FONT_SCALE[fontSize]);
}
