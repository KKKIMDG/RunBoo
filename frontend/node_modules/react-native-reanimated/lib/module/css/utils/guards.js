'use strict';

import { isNumber, isPercentage } from '../../common';
import { ANIMATION_PROPS, TRANSITION_PROPS, VALID_PARAMETRIZED_TIMING_FUNCTIONS, VALID_PREDEFINED_TIMING_FUNCTIONS, VALID_STEPS_MODIFIERS } from '../constants';
const ANIMATION_PROPS_SET = new Set(ANIMATION_PROPS);
const TRANSITION_PROPS_SET = new Set(TRANSITION_PROPS);
const VALID_STEPS_MODIFIERS_SET = new Set(VALID_STEPS_MODIFIERS);
const VALID_PREDEFINED_TIMING_FUNCTIONS_SET = new Set(VALID_PREDEFINED_TIMING_FUNCTIONS);
const VALID_PARAMETRIZED_TIMING_FUNCTIONS_SET = new Set(VALID_PARAMETRIZED_TIMING_FUNCTIONS);
export const isPredefinedTimingFunction = value => VALID_PREDEFINED_TIMING_FUNCTIONS_SET.has(value);
export const smellsLikeTimingFunction = value => VALID_PREDEFINED_TIMING_FUNCTIONS_SET.has(value) || VALID_PARAMETRIZED_TIMING_FUNCTIONS_SET.has(value.split('(')[0].trim());
export const isAnimationProp = key => ANIMATION_PROPS_SET.has(key);
export const isTransitionProp = key => TRANSITION_PROPS_SET.has(key);
export const isStepsModifier = value => VALID_STEPS_MODIFIERS_SET.has(value);
export const isCSSStyleProp = key => isTransitionProp(key) || isAnimationProp(key);
export const isTimeUnit = value =>
// TODO: implement more strict check
typeof value === 'string' && (/^-?(\d+)?(\.\d+)?(ms|s)$/.test(value) || value === '0');
export const isLength = value => isNumber(value) || isPercentage(value);
export const isArrayOfLength = (value, length) => Array.isArray(value) && value.length === length;
export const isCSSKeyframesObject = value => typeof value === 'object' && Object.keys(value).length > 0;
export const isCSSKeyframesRule = value => typeof value === 'object' && 'cssRules' in value && 'cssText' in value;
//# sourceMappingURL=guards.js.map