type DynamicFlagsType = {
    EXAMPLE_DYNAMIC_FLAG: boolean;
    init(): void;
    setFlag(name: DynamicFlagName, value: boolean): void;
    getFlag(name: DynamicFlagName): boolean;
};
type DynamicFlagName = keyof Omit<Omit<DynamicFlagsType, 'setFlag' | 'getFlag'>, 'init'>;
/** @knipIgnore */
export declare const DynamicFlags: DynamicFlagsType;
export declare function setDynamicFeatureFlag(name: DynamicFlagName, value: boolean): void;
export declare function getDynamicFeatureFlag(name: DynamicFlagName): boolean;
/**
 * This constant is needed for typechecking and preserving static typechecks in
 * generated .d.ts files. Without it, the static flags resolve to an object
 * without specific keys.
 */
declare const DefaultStaticFeatureFlags: {
    readonly RUNTIME_TEST_FLAG: false;
    readonly DISABLE_COMMIT_PAUSING_MECHANISM: false;
    readonly ANDROID_SYNCHRONOUSLY_UPDATE_UI_PROPS: false;
    readonly IOS_SYNCHRONOUSLY_UPDATE_UI_PROPS: false;
    readonly EXPERIMENTAL_CSS_ANIMATIONS_FOR_SVG_COMPONENTS: false;
    readonly USE_SYNCHRONIZABLE_FOR_MUTABLES: false;
    readonly USE_COMMIT_HOOK_ONLY_FOR_REACT_COMMITS: false;
    readonly ENABLE_SHARED_ELEMENT_TRANSITIONS: false;
    readonly FORCE_REACT_RENDER_FOR_SETTLED_ANIMATIONS: false;
};
type StaticFeatureFlagsSchema = {
    -readonly [K in keyof typeof DefaultStaticFeatureFlags]: boolean;
};
export declare function getStaticFeatureFlag(name: keyof StaticFeatureFlagsSchema): boolean;
export {};
//# sourceMappingURL=index.d.ts.map