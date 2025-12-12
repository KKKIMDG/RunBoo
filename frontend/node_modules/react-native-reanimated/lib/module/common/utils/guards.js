'use strict';
'worklet';

export const isDefined = value => value !== undefined && value !== null;
export const isAngle = value => typeof value === 'string' && /^-?\d+(\.\d+)?(deg|rad)$/.test(value);
export const isNumber = value => typeof value === 'number' && !isNaN(value);
export const isNumberArray = value => Array.isArray(value) && value.every(isNumber);
export const isLength = value => {
  return value.endsWith('px') || !isNaN(Number(value));
};
export const isPercentage = value => typeof value === 'string' && /^-?\d+(\.\d+)?%$/.test(value);
export const isRecord = value => typeof value === 'object' && value !== null && !Array.isArray(value);
export const hasProp = (obj, key) => key in obj;
export const isConfigPropertyAlias = value => !!value && typeof value === 'object' && 'as' in value && typeof value.as === 'string';
//# sourceMappingURL=guards.js.map