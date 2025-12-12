'use strict';

import { hasSuffix } from '../../utils';
export function parseDimensionValue(value) {
  if (typeof value === 'object') {
    return;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (!hasSuffix(value)) {
    return `${value}px`;
  }
  return value;
}
//# sourceMappingURL=utils.js.map