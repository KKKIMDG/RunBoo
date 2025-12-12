import type { PredefinedTimingFunction, StepsModifier } from '../easing/types';
import type { CSSAnimationKeyframes, CSSAnimationProp, CSSKeyframesRule, CSSStyleProp, CSSTransitionProp, Repeat, TimeUnit } from '../types';
export declare const isPredefinedTimingFunction: (value: string) => value is PredefinedTimingFunction;
export declare const smellsLikeTimingFunction: (value: string) => boolean;
export declare const isAnimationProp: (key: string) => key is CSSAnimationProp;
export declare const isTransitionProp: (key: string) => key is CSSTransitionProp;
export declare const isStepsModifier: (value: string) => value is StepsModifier;
export declare const isCSSStyleProp: (key: string) => key is CSSStyleProp;
export declare const isTimeUnit: (value: unknown) => value is TimeUnit;
export declare const isLength: (value: unknown) => value is `${number}%` | number;
export declare const isArrayOfLength: <T, L extends number>(value: T[], length: L) => value is Repeat<T, L>;
export declare const isCSSKeyframesObject: (value: object) => value is CSSAnimationKeyframes;
export declare const isCSSKeyframesRule: (value: object) => value is CSSKeyframesRule;
//# sourceMappingURL=guards.d.ts.map