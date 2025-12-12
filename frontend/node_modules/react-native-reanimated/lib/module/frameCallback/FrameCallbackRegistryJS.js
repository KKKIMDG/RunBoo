'use strict';

import { scheduleOnUI } from 'react-native-worklets';
import { prepareUIRegistry } from './FrameCallbackRegistryUI';
export default class FrameCallbackRegistryJS {
  nextCallbackId = 0;
  constructor() {
    prepareUIRegistry();
  }
  registerFrameCallback(callback) {
    if (!callback) {
      return -1;
    }
    const callbackId = this.nextCallbackId;
    this.nextCallbackId++;
    scheduleOnUI(() => {
      global._frameCallbackRegistry.registerFrameCallback(callback, callbackId);
    });
    return callbackId;
  }
  unregisterFrameCallback(callbackId) {
    scheduleOnUI(() => {
      global._frameCallbackRegistry.unregisterFrameCallback(callbackId);
    });
  }
  manageStateFrameCallback(callbackId, state) {
    scheduleOnUI(() => {
      global._frameCallbackRegistry.manageStateFrameCallback(callbackId, state);
    });
  }
}
//# sourceMappingURL=FrameCallbackRegistryJS.js.map