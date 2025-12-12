'use strict';

import AnimatedComponentImpl from './AnimatedComponent';

/**
 * @deprecated Please use `Animated.FlatList` component instead of calling
 *   `Animated.createAnimatedComponent(FlatList)` manually.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any

/**
 * Lets you create an Animated version of any React Native component.
 *
 * @param Component - The component you want to make animatable.
 * @returns A component that Reanimated is capable of animating.
 * @see https://docs.swmansion.com/react-native-reanimated/docs/core/createAnimatedComponent
 */
import { jsx as _jsx } from "react/jsx-runtime";
export function createAnimatedComponent(Component) {
  class AnimatedComponent extends AnimatedComponentImpl {
    static displayName = `AnimatedComponent(${Component.displayName || Component.name || 'Component'})`;
    constructor(props) {
      super(Component, props);
    }
  }
  const animatedComponent = props => {
    return /*#__PURE__*/_jsx(AnimatedComponent, {
      ...props,
      // Needed to prevent react from signing AnimatedComponent to the ref
      // (we want to handle the ref assignment in the AnimatedComponent)
      ref: null,
      ...(props.ref === null ? null : {
        forwardedRef: props.ref
      })
    });
  };
  animatedComponent.displayName = Component.displayName || Component.name || 'Component';
  return animatedComponent;
}
//# sourceMappingURL=createAnimatedComponent.js.map