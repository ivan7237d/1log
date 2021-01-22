import { applyPipe } from 'antiutils';
import { pluginSymbol, PluginType, ProxyPlugin } from '../logger/plugin';
import { increaseStackLevel } from '../logger/stackLevel';
import { excludeFromTimeDelta, includeInTimeDelta } from '../logger/timeDelta';
import { logPalette } from '../logPalette';

/**
 * If the piped value is a function, logs its creation, calls and returns.
 */
export const functionPlugin: ProxyPlugin = {
  [pluginSymbol]: PluginType.Proxy,
  scope: (value) => typeof value === 'function',
  transform: (log) => <Parameters extends unknown[], Result>(
    value: (...args: Parameters) => Result,
  ): ((...args: Parameters) => Result) =>
    excludeFromTimeDelta((...args: Parameters) => {
      log([{ caption: 'call', color: logPalette.green }], ...args);
      const result = applyPipe(
        value,
        includeInTimeDelta,
        increaseStackLevel,
      )(...args);
      log([{ caption: 'return', color: logPalette.purple }], result);
      return result;
    }),
};
