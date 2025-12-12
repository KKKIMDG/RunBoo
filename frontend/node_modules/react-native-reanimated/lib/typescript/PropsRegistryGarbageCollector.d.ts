import type { IAnimatedComponentInternal } from './createAnimatedComponent/commonTypes';
export declare const PropsRegistryGarbageCollector: {
    viewsCount: number;
    viewsMap: Map<number, IAnimatedComponentInternal>;
    intervalId: NodeJS.Timeout | null;
    registerView(viewTag: number, component: IAnimatedComponentInternal): void;
    unregisterView(viewTag: number): void;
    syncPropsBackToReact(): void;
    registerInterval(): void;
    unregisterInterval(): void;
};
//# sourceMappingURL=PropsRegistryGarbageCollector.d.ts.map