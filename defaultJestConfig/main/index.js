'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const lib = require('../..');

expect.addSnapshotSerializer(lib.jestMessagesSerializer);
expect.addSnapshotSerializer(lib.jestIterableSerializer);
expect.addSnapshotSerializer(lib.jestAsyncIterableSerializer);

lib.installPlugins(
  lib.mockHandlerPlugin(),
  lib.functionPlugin,
  lib.promisePlugin,
  lib.iterablePlugin,
  lib.asyncIterablePlugin,
);

beforeEach(() => {
  jest.useFakeTimers('modern');
  lib.resetTimeDelta();
  lib.resetBadgeNumbers();
  lib.getMessages();
});

afterEach(() => {
  jest.useRealTimers();
});
