import {
  functionPlugin,
  getMessages,
  installPlugin,
  jestSerializer,
  mockHandlerPlugin,
  promisePlugin,
  resetBadgeNumbers,
  resetTimeDelta,
} from '../..';

expect.addSnapshotSerializer(jestSerializer);
installPlugin(mockHandlerPlugin);
installPlugin(functionPlugin);
installPlugin(promisePlugin);

beforeEach(() => {
  jest.useFakeTimers('modern');
  resetTimeDelta();
  resetBadgeNumbers();
  getMessages();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
