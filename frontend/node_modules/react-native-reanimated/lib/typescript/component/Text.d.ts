import { Text } from 'react-native';
interface AnimatedTextComplement extends Text {
    getNode(): Text;
}
export declare const AnimatedText: import("../createAnimatedComponent").AnimatedComponentType<Readonly<import("react-native").TextProps>, typeof Text>;
export type AnimatedText = typeof AnimatedText & AnimatedTextComplement;
export {};
//# sourceMappingURL=Text.d.ts.map