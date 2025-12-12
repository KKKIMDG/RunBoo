import type { ILayoutAnimationBuilder, LayoutAnimationFunction, StyleProps } from './commonTypes';
import type { NestedArray } from './createAnimatedComponent/commonTypes';
export declare function checkStyleOverwriting(layoutAnimationOrBuilder: ILayoutAnimationBuilder | LayoutAnimationFunction | Keyframe, style: NestedArray<StyleProps>, displayName: string, onWarn: () => void): void;
export declare function maybeBuild(layoutAnimationOrBuilder: ILayoutAnimationBuilder | LayoutAnimationFunction | Keyframe): LayoutAnimationFunction | Keyframe;
//# sourceMappingURL=animationBuilder.d.ts.map