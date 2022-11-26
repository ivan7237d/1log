import {
  asyncIterablePlugin,
  functionPlugin,
  getMessages,
  installPlugins,
  iterablePlugin,
  jestAsyncIterableSerializer,
  jestIterableSerializer,
  jestMessagesSerializer,
  mockHandlerPlugin,
  promisePlugin,
  resetBadgeNumbers,
  resetTimeDelta,
} from ".";

expect.addSnapshotSerializer(jestMessagesSerializer);
expect.addSnapshotSerializer(jestIterableSerializer);
expect.addSnapshotSerializer(jestAsyncIterableSerializer);

installPlugins(
  mockHandlerPlugin(),
  functionPlugin,
  promisePlugin,
  iterablePlugin,
  asyncIterablePlugin
);

beforeEach(() => {
  jest.useFakeTimers();
  resetTimeDelta();
  resetBadgeNumbers();
  getMessages();
});

afterEach(() => {
  jest.useRealTimers();
});
