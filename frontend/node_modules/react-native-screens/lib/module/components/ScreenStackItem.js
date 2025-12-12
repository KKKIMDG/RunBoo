function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
import warnOnce from 'warn-once';
import DebugContainer from './DebugContainer';
import { ScreenStackHeaderConfig } from './ScreenStackHeaderConfig';
import Screen from './Screen';
import ScreenStack from './ScreenStack';
import { RNSScreensRefContext } from '../contexts';
import { FooterComponent } from './ScreenFooter';
import SafeAreaView from './safe-area/SafeAreaView';
function ScreenStackItem({
  children,
  headerConfig,
  activityState,
  shouldFreeze,
  stackPresentation,
  sheetAllowedDetents,
  contentStyle,
  style,
  screenId,
  // eslint-disable-next-line camelcase
  unstable_sheetFooter,
  ...rest
}, ref) {
  const currentScreenRef = React.useRef(null);
  const screenRefs = React.useContext(RNSScreensRefContext);
  React.useImperativeHandle(ref, () => currentScreenRef.current);
  const isHeaderInModal = Platform.OS === 'android' ? false : stackPresentation !== 'push' && headerConfig?.hidden === false;
  const headerHiddenPreviousRef = React.useRef(headerConfig?.hidden);
  React.useEffect(() => {
    warnOnce(Platform.OS !== 'android' && stackPresentation !== 'push' && headerHiddenPreviousRef.current !== headerConfig?.hidden, `Dynamically changing header's visibility in modals will result in remounting the screen and losing all local state.`);
    headerHiddenPreviousRef.current = headerConfig?.hidden;
  }, [headerConfig?.hidden, stackPresentation]);
  const debugContainerStyle = getPositioningStyle(sheetAllowedDetents, stackPresentation);

  // For iOS, we need to extract background color and apply it to Screen
  // due to the safe area inset at the bottom of ScreenContentWrapper
  let internalScreenStyle;
  if (stackPresentation === 'formSheet' && Platform.OS === 'ios' && contentStyle) {
    const {
      screenStyles,
      contentWrapperStyles
    } = extractScreenStyles(contentStyle);
    internalScreenStyle = screenStyles;
    contentStyle = contentWrapperStyles;
  }
  const shouldUseSafeAreaView = Platform.OS === 'ios' && parseInt(Platform.Version, 10) >= 26;
  const content = /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(DebugContainer, {
    contentStyle: contentStyle,
    style: debugContainerStyle,
    stackPresentation: stackPresentation ?? 'push'
  }, shouldUseSafeAreaView ? /*#__PURE__*/React.createElement(SafeAreaView, {
    edges: getSafeAreaEdges(headerConfig)
  }, children) : children), /*#__PURE__*/React.createElement(ScreenStackHeaderConfig, headerConfig), stackPresentation === 'formSheet' && unstable_sheetFooter && /*#__PURE__*/React.createElement(FooterComponent, null, unstable_sheetFooter()));
  return /*#__PURE__*/React.createElement(Screen, _extends({
    ref: node => {
      currentScreenRef.current = node;
      if (screenRefs === null) {
        console.warn('Looks like RNSScreensRefContext is missing. Make sure the ScreenStack component is wrapped in it');
        return;
      }
      const currentRefs = screenRefs.current;
      if (node === null) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete currentRefs[screenId];
      } else {
        currentRefs[screenId] = {
          current: node
        };
      }
    },
    enabled: true,
    isNativeStack: true,
    activityState: activityState,
    shouldFreeze: shouldFreeze,
    screenId: screenId,
    stackPresentation: stackPresentation,
    hasLargeHeader: headerConfig?.largeTitle ?? false,
    sheetAllowedDetents: sheetAllowedDetents,
    style: [style, internalScreenStyle]
  }, rest), isHeaderInModal ? /*#__PURE__*/React.createElement(ScreenStack, {
    style: styles.container
  }, /*#__PURE__*/React.createElement(Screen, {
    enabled: true,
    isNativeStack: true,
    activityState: activityState,
    shouldFreeze: shouldFreeze,
    hasLargeHeader: headerConfig?.largeTitle ?? false,
    style: StyleSheet.absoluteFill
  }, content)) : content);
}
export default /*#__PURE__*/React.forwardRef(ScreenStackItem);
function getPositioningStyle(allowedDetents, presentation) {
  const isIOS = Platform.OS === 'ios';
  if (presentation !== 'formSheet') {
    return styles.container;
  }
  if (isIOS) {
    if (allowedDetents === 'fitToContents') {
      return styles.absolute;
    } else {
      return styles.container;
    }
  }

  // Other platforms, tested reliably only on Android
  if (allowedDetents === 'fitToContents') {
    return {};
  }
  return styles.container;
}
// TODO: figure out whether other styles, like borders, filters, etc.
// shouldn't be applied on the Screen level on iOS due to the inset.
function extractScreenStyles(style) {
  const flatStyle = StyleSheet.flatten(style);
  const {
    backgroundColor,
    ...contentWrapperStyles
  } = flatStyle;
  const screenStyles = {
    backgroundColor
  };
  return {
    screenStyles,
    contentWrapperStyles
  };
}
function getSafeAreaEdges(headerConfig) {
  if (Platform.OS !== 'ios' || parseInt(Platform.Version, 10) < 26) {
    return {};
  }
  let defaultEdges;
  if (headerConfig?.translucent || headerConfig?.hidden) {
    defaultEdges = {};
  } else {
    defaultEdges = {
      top: true
    };
  }
  return defaultEdges;
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  absolute: {
    position: 'absolute',
    top: 0,
    start: 0,
    end: 0
  }
});
//# sourceMappingURL=ScreenStackItem.js.map