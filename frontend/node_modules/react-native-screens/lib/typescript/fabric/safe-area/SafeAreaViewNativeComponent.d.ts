import { ViewProps } from 'react-native';
import { WithDefault } from 'react-native/Libraries/Types/CodegenTypesNamespace';
type InsetType = 'all' | 'system' | 'interface';
export interface NativeProps extends ViewProps {
    edges?: Readonly<{
        top: boolean;
        right: boolean;
        bottom: boolean;
        left: boolean;
    }>;
    insetType?: WithDefault<InsetType, 'all'>;
}
declare const _default: import("react-native/Libraries/Utilities/codegenNativeComponent").NativeComponentType<NativeProps>;
export default _default;
//# sourceMappingURL=SafeAreaViewNativeComponent.d.ts.map