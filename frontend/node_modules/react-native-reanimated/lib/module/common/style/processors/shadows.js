'use strict';
'worklet';

import { IS_ANDROID } from '../../constants';
import { ReanimatedError } from '../../errors';
import { parseBoxShadowString } from '../../utils';
import { processColor } from './colors';
const ERROR_MESSAGES = {
  notArrayObject: value => `Box shadow value must be a string or an array of shadow objects (e.g. [{ offsetX, offsetY, color }]). Received: ${JSON.stringify(value)}.`,
  invalidColor: (color, boxShadow) => `Invalid color "${color}" in box shadow "${boxShadow}".`
};
const parseBlurRadius = value => {
  if (IS_ANDROID) {
    // Android crashes when blurRadius is smaller than 1
    return Math.max(parseFloat(value), 1);
  }
  return parseFloat(value);
};
export const processBoxShadowNative = (value, context) => {
  if (value === 'none') {
    return;
  }
  const parsedShadow = typeof value === 'string' ? parseBoxShadowString(value) : value;
  if (!Array.isArray(parsedShadow)) {
    throw new ReanimatedError(ERROR_MESSAGES.notArrayObject(parsedShadow));
  }
  return parsedShadow.map(shadow => {
    const {
      color = '#000',
      offsetX = 0,
      offsetY = 0,
      spreadDistance = 0,
      blurRadius = 0,
      ...rest
    } = shadow;
    const processedColor = processColor(color, context);
    if (processedColor === undefined) {
      throw new ReanimatedError(ERROR_MESSAGES.invalidColor(color, JSON.stringify(shadow)));
    }
    return {
      ...rest,
      blurRadius: parseBlurRadius(blurRadius),
      color: processedColor,
      offsetX: parseFloat(offsetX),
      offsetY: parseFloat(offsetY),
      spreadDistance: parseFloat(spreadDistance)
    };
  });
};
//# sourceMappingURL=shadows.js.map