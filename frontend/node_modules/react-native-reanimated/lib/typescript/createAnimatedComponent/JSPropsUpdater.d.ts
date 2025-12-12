import type { AnimatedComponentProps, AnimatedComponentTypeInternal, IAnimatedComponentInternal, IJSPropsUpdater, InitialComponentProps, JSPropsOperation } from './commonTypes';
declare class JSPropsUpdaterNative implements IJSPropsUpdater {
    private static _tagToComponentMapping;
    registerComponent(animatedComponent: AnimatedComponentTypeInternal, jsProps: string[]): void;
    unregisterComponent(animatedComponent: AnimatedComponentTypeInternal): void;
    updateProps(operations: JSPropsOperation[]): void;
}
declare class JSPropsUpdaterWeb implements IJSPropsUpdater {
    registerComponent(_animatedComponent: React.Component<AnimatedComponentProps<InitialComponentProps>> & IAnimatedComponentInternal): void;
    unregisterComponent(_animatedComponent: React.Component<AnimatedComponentProps<InitialComponentProps>> & IAnimatedComponentInternal): void;
    updateProps(_operations: JSPropsOperation[]): void;
}
declare const jsPropsUpdater: JSPropsUpdaterNative | JSPropsUpdaterWeb;
export default jsPropsUpdater;
//# sourceMappingURL=JSPropsUpdater.d.ts.map