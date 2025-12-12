import type { ComponentRef, ComponentType, ReactNode, Ref } from 'react';
import type React from 'react';
import type { FlatList, FlatListProps } from 'react-native';
import type { AnyRecord } from '../../common';
import type { AnimatedRef } from '../../hook';
import type { CSSProps } from '../types';
type AnimatedComponentType<Props extends AnyRecord = object, Instance = unknown> = (props: Omit<CSSProps<Props>, 'ref'> & {
    ref?: Ref<Instance> | AnimatedRef;
}) => ReactNode;
/**
 * @deprecated Please use `Animated.FlatList` component instead of calling
 *   `Animated.createAnimatedComponent(FlatList)` manually.
 */
export declare function createAnimatedComponent<T = any>(Component: typeof FlatList<T>): AnimatedComponentType<Readonly<FlatListProps<T>>, ComponentRef<typeof FlatList<T>>>;
/**
 * Lets you create an Animated version of any React Native component.
 *
 * @param Component - The component you want to make animatable.
 * @returns A component that Reanimated is capable of animating.
 * @see https://docs.swmansion.com/react-native-reanimated/docs/core/createAnimatedComponent
 */
export declare function createAnimatedComponent<TInstance extends ComponentType<any>>(Component: TInstance): AnimatedComponentType<Readonly<React.ComponentProps<TInstance>>, ComponentRef<TInstance>>;
export {};
//# sourceMappingURL=createAnimatedComponent.d.ts.map