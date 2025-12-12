import type { DynamicColorIOS as RNDynamicColorIOS, OpaqueColorValue } from 'react-native';
import type { StyleProps } from '../../../commonTypes';
import { type ValueProcessorContext } from '../../types';
/**
 * Copied from:
 * https://github.com/facebook/react-native/blob/v0.81.0/packages/react-native/Libraries/StyleSheet/PlatformColorValueTypes.d.ts
 */
export declare function PlatformColor(...names: string[]): OpaqueColorValue;
type PlatformColorObject = {
    semantic: Array<string>;
    resource_paths?: never;
} | {
    semantic?: never;
    resource_paths?: Array<string>;
};
type DynamicColorIOSTuple = Parameters<typeof RNDynamicColorIOS>[0];
export declare function DynamicColorIOS(tuple: DynamicColorIOSTuple): OpaqueColorValue;
type DynamicColorObjectIOS = {
    dynamic: DynamicColorIOSTuple;
};
export declare const ERROR_MESSAGES: {
    invalidColor: (color: unknown) => string;
    invalidProcessedColor: (color: unknown) => string;
    dynamicNotAvailableOnPlatform: () => string;
};
export declare function processColorNumber(value: unknown): number | null;
export type ProcessedDynamicColorObjectIOS = {
    dynamic: {
        light: number;
        dark: number;
        highContrastLight?: number;
        highContrastDark?: number;
    };
};
type ProcessedColor = number | PlatformColorObject | ProcessedDynamicColorObjectIOS;
/**
 * Processes a color value and returns a normalized color representation.
 *
 * @param value - The color value to process (string, number, or ColorValue)
 * @param context - Optional for target-specific processing context (e.g. CSS)
 * @returns The processed color value - `number` for valid colors, `false` for
 *   transparent colors
 */
export declare function processColor(value: string | number, context?: ValueProcessorContext): number;
export declare function processColor(value: unknown, context?: ValueProcessorContext): ProcessedColor;
export declare function unprocessColor(value: ProcessedColor): string | PlatformColorObject | DynamicColorObjectIOS;
export declare function processColorsInProps(props: StyleProps): void;
export declare function unprocessColorsInProps(props: StyleProps): void;
export {};
//# sourceMappingURL=colors.d.ts.map