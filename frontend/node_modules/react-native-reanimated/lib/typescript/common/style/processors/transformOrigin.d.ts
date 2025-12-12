import type { TransformOrigin, ValueProcessor } from '../../types';
type Axis = 'x' | 'y' | 'z';
export declare const ERROR_MESSAGES: {
    invalidTransformOrigin: (value: Readonly<TransformOrigin>) => string;
    invalidValue: (value: string | number, axis: Axis, origin: Readonly<TransformOrigin>, isArray: boolean) => string;
};
export declare const processTransformOrigin: ValueProcessor<TransformOrigin>;
export {};
//# sourceMappingURL=transformOrigin.d.ts.map