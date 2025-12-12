import type { StyleBuilder, StyleBuilderConfig } from '../../common';
export declare const ERROR_MESSAGES: {
    styleBuilderNotFound: (componentName: string) => string;
};
export declare function hasStyleBuilder(componentName: string): boolean;
export declare function getStyleBuilder(componentName: string): StyleBuilder;
export declare function registerComponentStyleBuilder(componentName: string, config: StyleBuilderConfig): void;
//# sourceMappingURL=registry.d.ts.map