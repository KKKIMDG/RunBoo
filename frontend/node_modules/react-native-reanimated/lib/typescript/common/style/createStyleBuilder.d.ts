import type { AnyRecord } from '../types';
import { ValueProcessorTarget } from '../types';
import type { StyleBuilder, StyleBuilderConfig, StyleBuildMiddleware } from './types';
type StyleBuilderOptions<P extends AnyRecord> = {
    buildMiddleware?: StyleBuildMiddleware<P>;
    separatelyInterpolatedNestedProperties?: (keyof P)[];
    target?: ValueProcessorTarget;
};
export default function createStyleBuilder<P extends AnyRecord>(config: StyleBuilderConfig<P>, options?: StyleBuilderOptions<P>): StyleBuilder<Partial<P>>;
export {};
//# sourceMappingURL=createStyleBuilder.d.ts.map