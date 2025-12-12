import type { ILayoutAnimationBuilder, LayoutAnimationFunction } from '../commonTypes';
import type { BaseAnimationBuilder } from './animationBuilder';
import { ComplexAnimationBuilder } from './animationBuilder';
export declare class SharedTransition extends ComplexAnimationBuilder implements ILayoutAnimationBuilder {
    static presetName: string;
    static createInstance<T extends typeof BaseAnimationBuilder>(this: T): InstanceType<T>;
    build: () => LayoutAnimationFunction;
}
//# sourceMappingURL=SharedTransition.d.ts.map