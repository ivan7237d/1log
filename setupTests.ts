import {
  functionPlugin,
  getMessages,
  installPlugins,
  iterableIteratorPlugin,
  jestMessagesSerializer,
  mockHandlerPlugin,
  promisePlugin,
  resetBadgeNumbers,
  resetTimeDelta,
} from './src';

expect.addSnapshotSerializer(jestMessagesSerializer);
expect.addSnapshotSerializer({
  test: (value) =>
    value !== undefined &&
    value !== null &&
    value[Symbol.iterator]?.() === value,
  serialize: () => `[IterableIterator]`,
});

installPlugins(
  mockHandlerPlugin(),
  functionPlugin,
  promisePlugin,
  iterableIteratorPlugin,
);

beforeEach(() => {
  jest.useFakeTimers('modern');
  resetTimeDelta();
  resetBadgeNumbers();
  getMessages();
});

afterEach(() => {
  jest.useRealTimers();
});
