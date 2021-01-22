'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const lib = require('../..');

expect.addSnapshotSerializer(lib.jestMessagesSerializer);
expect.addSnapshotSerializer({
  test: (value) =>
    value !== undefined &&
    value !== null &&
    value[Symbol.iterator]?.() === value,
  serialize: () => `[IterableIterator]`,
});

lib.installPlugins(
  lib.mockHandlerPlugin(),
  lib.functionPlugin,
  lib.promisePlugin,
  lib.iterableIteratorPlugin,
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
