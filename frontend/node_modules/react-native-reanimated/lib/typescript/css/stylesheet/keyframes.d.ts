import type { PlainStyle } from '../../common';
import type { CSSAnimationKeyframes, CSSKeyframesRule } from '../types';
export default function keyframes<S extends PlainStyle>(keyframeDefinitions: CSSAnimationKeyframes<Pick<S, keyof PlainStyle>> & CSSAnimationKeyframes<PlainStyle>): CSSKeyframesRule;
//# sourceMappingURL=keyframes.d.ts.map