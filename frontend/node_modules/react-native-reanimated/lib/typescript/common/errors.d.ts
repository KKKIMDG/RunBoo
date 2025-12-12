/**
 * Registers ReanimatedError in the global scope. Register only for Worklet
 * runtimes.
 */
export declare function registerReanimatedError(): void;
export declare const ReanimatedError: IReanimatedErrorConstructor;
interface IReanimatedErrorConstructor extends Error {
    new (message?: string): ReanimatedError;
    (message?: string): ReanimatedError;
    readonly prototype: ReanimatedError;
}
export type ReanimatedError = Error & {
    name: 'Reanimated';
};
export {};
//# sourceMappingURL=errors.d.ts.map