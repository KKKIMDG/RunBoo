import { View } from 'react-native';
interface AnimatedViewComplement extends View {
    getNode(): View;
}
export declare const AnimatedView: import("../createAnimatedComponent").AnimatedComponentType<Readonly<import("react-native").ViewProps>, typeof View>;
export type AnimatedView = typeof AnimatedView & AnimatedViewComplement;
export {};
//# sourceMappingURL=View.d.ts.map