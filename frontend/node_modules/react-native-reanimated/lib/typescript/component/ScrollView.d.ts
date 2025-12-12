import type { ComponentProps } from 'react';
import React from 'react';
import { ScrollView } from 'react-native';
import type { SharedValue } from '../commonTypes';
interface AnimatedScrollViewComplement extends ScrollView {
    getNode(): ScrollView;
}
declare const AnimatedScrollViewComponent: import("../createAnimatedComponent").AnimatedComponentType<Readonly<import("react-native").ScrollViewProps>, typeof ScrollView>;
export type AnimatedScrollViewProps = ComponentProps<typeof AnimatedScrollViewComponent> & {
    scrollViewOffset?: SharedValue<number>;
};
export declare function AnimatedScrollView({ scrollViewOffset, ref, ...restProps }: AnimatedScrollViewProps): React.JSX.Element;
export type AnimatedScrollView = AnimatedScrollViewComplement & typeof AnimatedScrollViewComponent;
export {};
//# sourceMappingURL=ScrollView.d.ts.map