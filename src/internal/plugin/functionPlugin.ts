import { applyPipe } from 'antiutils';
import { GlobalPlugin, globalPluginSymbol } from '../logger/plugin';
import { excludeFromTimeDelta, includeInTimeDelta } from '../logger/timeDelta';
import { logPalette } from '../logPalette';

/**
 * If the piped value is a function, logs its creation and invocations.
 */
export const functionPlugin: GlobalPlugin = {
  type: globalPluginSymbol,
  proxy: {
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    scope: (value) => typeof value === 'function',
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    transform: (log) => <Parameters extends unknown[], Result>(
      value: (...args: Parameters) => Result,
    ): ((...args: Parameters) => Result) =>
      excludeFromTimeDelta((...args: Parameters) => {
        const increaseStackLevel = log(
          [{ caption: 'call', color: logPalette.green }],
          ...args,
        );
        const result = applyPipe(
          value,
          includeInTimeDelta,
          increaseStackLevel,
        )(...args);
        log([{ caption: 'return', color: logPalette.purple }], result);
        return result;
      }),
  },
};
