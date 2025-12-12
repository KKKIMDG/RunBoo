'use strict';

import { processColorNumber, ReanimatedError } from '../../../../common';
export const ERROR_MESSAGES = {
  invalidColor: color => `Invalid color value: ${JSON.stringify(color)}`
};
export const processColorSVG = value => {
  const processed = processColorNumber(value);
  if (processed) {
    return processed;
  }
  if (value === 'transparent') {
    return false;
  }
  if (value === 'currentColor') {
    return 'currentColor';
  }
  throw new ReanimatedError(ERROR_MESSAGES.invalidColor(value));
};
//# sourceMappingURL=colors.js.map