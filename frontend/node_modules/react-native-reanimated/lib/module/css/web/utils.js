'use strict';

import { kebabizeCamelCase, maybeAddSuffix, ReanimatedError } from '../../common';
import { CubicBezierEasing, LinearEasing, StepsEasing } from '../easing';
export function maybeAddSuffixes(object, key, suffix) {
  if (!(key in object)) {
    return [];
  }
  return object[key].map(value => maybeAddSuffix(value, suffix));
}
function easingMapper(easing) {
  if (typeof easing === 'string') {
    return easing;
  }
  if (easing instanceof StepsEasing) {
    return `steps(${easing.stepsNumber}, ${kebabizeCamelCase(easing.modifier)})`;
  }
  if (easing instanceof CubicBezierEasing) {
    return `cubic-bezier(${easing.x1}, ${easing.y1}, ${easing.x2}, ${easing.y2})`;
  }
  if (easing instanceof LinearEasing) {
    const values = easing.points.map(point => Array.isArray(point) ? point.join(' ') : point).join(', ');
    return `linear(${values})`;
  }
  throw new ReanimatedError(`Invalid timing function ${easing.toString()}`);
}
export function parseTimingFunction(timingFunction) {
  if (Array.isArray(timingFunction)) {
    return timingFunction.map(easingMapper).join(', ');
  }
  return easingMapper(timingFunction);
}
//# sourceMappingURL=utils.js.map