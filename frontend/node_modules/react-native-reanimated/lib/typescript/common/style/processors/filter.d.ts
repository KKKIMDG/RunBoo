import type { FilterFunction } from 'react-native';
import type { FilterArray, ValueProcessor } from '../../types';
export declare const ERROR_MESSAGES: {
    invalidFilter: (filter: string) => string;
    invalidFilterType: (filter: readonly FilterFunction[]) => string;
};
export declare const processFilter: ValueProcessor<ReadonlyArray<FilterFunction> | string, FilterArray>;
//# sourceMappingURL=filter.d.ts.map