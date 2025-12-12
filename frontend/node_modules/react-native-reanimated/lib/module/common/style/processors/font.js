'use strict';

import { FONT_WEIGHT_MAPPINGS } from '../../constants';
import { ReanimatedError } from '../../errors';
export const ERROR_MESSAGES = {
  invalidFontWeight: weight => `Invalid font weight value: ${weight}`
};
const VALID_FONT_WEIGHTS = new Set(Object.values(FONT_WEIGHT_MAPPINGS));
export const processFontWeight = value => {
  const stringValue = value.toString();
  if (VALID_FONT_WEIGHTS.has(stringValue)) {
    return stringValue;
  }
  if (stringValue in FONT_WEIGHT_MAPPINGS) {
    return FONT_WEIGHT_MAPPINGS[stringValue];
  }
  throw new ReanimatedError(ERROR_MESSAGES.invalidFontWeight(value));
};
//# sourceMappingURL=font.js.map