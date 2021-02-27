import { pipe } from 'antiutils';
import { pluginSymbol, PluginType, ProxyPlugin } from '../logger/plugin';
import { increaseStackLevel } from '../logger/stackLevel';
import { excludeFromTimeDelta, includeInTimeDelta } from '../logger/timeDelta';
import { logPalette } from '../logPalette';

/**
 * If the piped value is a function (`constructor` is `Function`), logs its
 * creation, calls and returns.
 */
export const functionPlugin: ProxyPlugin = {
  [pluginSymbol]: PluginType.Proxy,
  scope: (value) =>
    value !== null &&
    value !== undefined &&
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    (value as any).constructor === Function,
  transform: (log) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any =>
    Object.assign(
      excludeFromTimeDelta((...args) => {
        log([{ caption: 'call', color: logPalette.green }], ...args);
        const result = pipe(
          value,
          includeInTimeDelta,
          increaseStackLevel,
        )(...args);
        log([{ caption: 'return', color: logPalette.purple }], result);
        return result;
      }),
      value,
    ),
};
