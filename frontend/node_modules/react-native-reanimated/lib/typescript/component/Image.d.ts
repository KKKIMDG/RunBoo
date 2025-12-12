import { Image } from 'react-native';
type AnimatedImageComplement = Image & {
    getNode(): Image;
};
export declare const AnimatedImage: import("../createAnimatedComponent").AnimatedComponentType<Readonly<import("react-native").ImageProps>, typeof Image>;
export type AnimatedImage = typeof AnimatedImage & AnimatedImageComplement;
export {};
//# sourceMappingURL=Image.d.ts.map