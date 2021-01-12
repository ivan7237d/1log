'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const lib = require('../..');

expect.addSnapshotSerializer(lib.jestSerializer);
lib.installPlugin(lib.mockHandlerPlugin);
lib.installPlugin(lib.functionPlugin);
lib.installPlugin(lib.promisePlugin);

beforeEach(() => {
  jest.useFakeTimers('modern');
  lib.resetTimeDelta();
  lib.resetBadgeNumbers();
  lib.getMessages();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
