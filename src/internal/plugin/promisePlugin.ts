import { pluginSymbol, PluginType, ProxyPlugin } from '../logger/plugin';
import { excludeFromTimeDelta, includeInTimeDelta } from '../logger/timeDelta';
import { logPalette } from '../logPalette';

/**
 * If the piped value is a promise, logs its creation and
 * fullfillment/rejection.
 */
export const promisePlugin: ProxyPlugin = {
  [pluginSymbol]: PluginType.Proxy,
  scope: (value) =>
    value !== null &&
    value !== undefined &&
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    (value as any).constructor === Promise,
  transform: (log) => <T>(value: Promise<T>): Promise<T> =>
    new Promise((resolve, reject) => {
      value.then(
        excludeFromTimeDelta((result) => {
          log([{ caption: 'resolve', color: logPalette.yellow }], result);
          includeInTimeDelta(resolve)(result);
        }),
        excludeFromTimeDelta((reason) => {
          log([{ caption: 'reject', color: logPalette.red }], reason);
          includeInTimeDelta(reject)(reason);
        }),
      );
    }),
};
