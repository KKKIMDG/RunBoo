import type { AnyRecord, ConfigPropertyAlias } from '../types';
export declare const isDefined: <T>(value: T) => value is NonNullable<T>;
export declare const isAngle: (value: string | number) => value is `${number}deg` | `${number}rad`;
export declare const isNumber: (value: unknown) => value is number;
export declare const isNumberArray: (value: unknown) => value is number[];
export declare const isLength: (value: string) => boolean;
export declare const isPercentage: (value: unknown) => value is `${number}%`;
export declare const isRecord: <T extends AnyRecord = AnyRecord>(value: unknown) => value is T;
export declare const hasProp: <P extends AnyRecord, K extends string>(obj: P, key: K) => obj is P & Record<K, string>;
export declare const isConfigPropertyAlias: <P extends AnyRecord>(value: unknown) => value is ConfigPropertyAlias<P>;
//# sourceMappingURL=guards.d.ts.map