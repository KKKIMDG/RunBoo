export type FontSizeSetting = "SMALL" | "MEDIUM" | "LARGE";

const FONT_SCALE: Record<FontSizeSetting, number> = {
    SMALL: 1,
    MEDIUM: 1.1,
    LARGE: 1.2,
};

export function scaleFont(
    baseSize: number,
    fontSize: FontSizeSetting
) {
    return Math.round(baseSize * FONT_SCALE[fontSize]);
}
