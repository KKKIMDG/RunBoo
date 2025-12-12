'use strict';

import { BASE_PROPERTIES_CONFIG, createStyleBuilder, ReanimatedError, ValueProcessorTarget } from '../../common';
export const ERROR_MESSAGES = {
  styleBuilderNotFound: componentName => `CSS style builder for component ${componentName} was not found`
};
const baseStyleBuilder = createStyleBuilder(BASE_PROPERTIES_CONFIG, {
  separatelyInterpolatedNestedProperties: ['boxShadow', 'shadowOffset', 'textShadowOffset', 'transformOrigin'],
  target: ValueProcessorTarget.CSS
});
const STYLE_BUILDERS = {};
export function hasStyleBuilder(componentName) {
  return !!STYLE_BUILDERS[componentName] || componentName.startsWith('RCT');
}
export function getStyleBuilder(componentName) {
  const styleBuilder = STYLE_BUILDERS[componentName];
  if (styleBuilder) {
    return styleBuilder;
  }

  // This captures all React Native components
  if (componentName.startsWith('RCT')) {
    return baseStyleBuilder;
  }
  throw new ReanimatedError(ERROR_MESSAGES.styleBuilderNotFound(componentName));
}
export function registerComponentStyleBuilder(componentName, config) {
  STYLE_BUILDERS[componentName] = createStyleBuilder(config, {
    target: ValueProcessorTarget.CSS
  });
}
//# sourceMappingURL=registry.js.map