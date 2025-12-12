import type { ConvertValuesToArrays } from '../../common';
import type { ParametrizedTimingFunction } from '../easing';
import type { AddArrayPropertyType } from '../types';
export declare function maybeAddSuffixes<T, K extends keyof T>(object: ConvertValuesToArrays<T>, key: K, suffix: string): string[];
export declare function parseTimingFunction(timingFunction: AddArrayPropertyType<ParametrizedTimingFunction | string>): string;
//# sourceMappingURL=utils.d.ts.map