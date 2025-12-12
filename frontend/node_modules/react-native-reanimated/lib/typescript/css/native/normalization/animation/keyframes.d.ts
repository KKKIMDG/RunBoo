import type { AnyRecord, StyleBuilder } from '../../../../common';
import type { StyleProps } from '../../../../commonTypes';
import type { CSSAnimationKeyframes, CSSAnimationKeyframeSelector, CSSAnimationTimingFunction } from '../../../types';
import type { NormalizedCSSAnimationKeyframesConfig } from '../../types';
export declare const ERROR_MESSAGES: {
    invalidOffsetType: (selector: CSSAnimationKeyframeSelector) => string;
    invalidOffsetRange: (selector: CSSAnimationKeyframeSelector) => string;
};
export declare function normalizeKeyframeSelector(keyframeSelector: CSSAnimationKeyframeSelector): number[];
type ProcessedKeyframes = Array<{
    offset: number;
    style: StyleProps;
    timingFunction?: CSSAnimationTimingFunction;
}>;
export declare function processKeyframes(keyframes: CSSAnimationKeyframes, styleBuilder: StyleBuilder<AnyRecord>): ProcessedKeyframes;
export declare function normalizeAnimationKeyframes(keyframes: CSSAnimationKeyframes, styleBuilder: StyleBuilder<AnyRecord>): NormalizedCSSAnimationKeyframesConfig;
export {};
//# sourceMappingURL=keyframes.d.ts.map