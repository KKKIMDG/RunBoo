import type { AnyRecord, PlainStyle } from '../../common';
import type { CSSStyle, CSSTransitionProperties, ExistingCSSAnimationProperties } from '../types';
export declare function filterCSSAndStyleProperties<S extends AnyRecord>(style: CSSStyle<S>): [
    ExistingCSSAnimationProperties | null,
    CSSTransitionProperties | null,
    PlainStyle
];
//# sourceMappingURL=props.d.ts.map