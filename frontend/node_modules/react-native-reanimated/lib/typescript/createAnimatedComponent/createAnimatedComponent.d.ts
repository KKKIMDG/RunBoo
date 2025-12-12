import type { ComponentRef, ComponentType, ReactNode, Ref } from 'react';
import type React from 'react';
import type { FlatList, FlatListProps } from 'react-native';
import type { AnyRecord } from '../common';
import type { InstanceOrElement } from '../commonTypes';
import type { AnimatedProps } from '../helperTypes';
import type { AnimatedRef } from '../hook';
import type { ExtractElementRef } from '../hook/commonTypes';
import type { Options } from './AnimatedComponent';
import type { InitialComponentProps } from './commonTypes';
type AnimatedComponentRef<TInstance> = Ref<ExtractElementRef<TInstance>> | (TInstance extends InstanceOrElement ? AnimatedRef<TInstance> : never) | AnimatedRef;
export type AnimatedComponentType<Props extends AnyRecord = object, Instance = unknown> = (props: Omit<AnimatedProps<Props>, 'ref'> & {
    ref?: AnimatedComponentRef<Instance>;
}) => ReactNode;
type AnimatableComponent<C extends ComponentType<any>> = C & {
    jsProps?: string[];
};
/**
 * @deprecated Please use `Animated.FlatList` component instead of calling
 *   `Animated.createAnimatedComponent(FlatList)` manually.
 */
export declare function createAnimatedComponent<T = any>(Component: typeof FlatList<T>, options?: Options<InitialComponentProps>): AnimatedComponentType<Readonly<FlatListProps<T>>, ComponentRef<typeof FlatList<T>>>;
/**
 * Lets you create an Animated version of any React Native component.
 *
 * @param Component - The component you want to make animatable.
 * @param options - Optional configuration object containing:
 *
 *   - `setNativeProps`: Function to set native props
 *   - `jsProps`: String array to select which props should be animated on JS
 *
 * @returns A component that Reanimated is capable of animating.
 * @see https://docs.swmansion.com/react-native-reanimated/docs/core/createAnimatedComponent
 */
export declare function createAnimatedComponent<TInstance extends AnimatableComponent<ComponentType<any>>>(Component: TInstance, options?: Options<InitialComponentProps>): AnimatedComponentType<Readonly<React.ComponentProps<TInstance>>, TInstance>;
export {};
//# sourceMappingURL=createAnimatedComponent.d.ts.map