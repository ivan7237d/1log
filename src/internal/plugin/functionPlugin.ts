import { pipe } from 'antiutils';
import { addNumberedBadge } from '../logger/addNumberedBadge';
import { pluginSymbol, PluginType, ProxyPlugin } from '../logger/plugin';
import { increaseStackLevel } from '../logger/stackLevel';
import { excludeFromTimeDelta, includeInTimeDelta } from '../logger/timeDelta';
import { logPalette } from '../logPalette';
import { isPromise } from './isPromise';

const AsyncFunction = (async () => {}).constructor;

/**
 * If the piped value is a function (`constructor` is `Function` or
 * `AsyncFunction`), logs its creation and invocations, and if it returns a
 * promise, fullfillment/rejection of that promise.
 */
export const functionPlugin: ProxyPlugin = {
  [pluginSymbol]: PluginType.Proxy,
  scope: (value) =>
    value !== null &&
    value !== undefined &&
    pipe(
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
      (value as any).constructor,
      (value) => value === Function || value === AsyncFunction,
    ),
  transform: (log) => (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): any => {
    const addCallBadge = addNumberedBadge('call', logPalette.green);
    return Object.assign(
      excludeFromTimeDelta((...args) => {
        const logWithCallBadge = addCallBadge(log);
        logWithCallBadge([], ...args);
        const result = pipe(
          value,
          includeInTimeDelta,
          increaseStackLevel,
        )(...args);
        const resultIsPromise = isPromise(result);
        logWithCallBadge(
          [
            resultIsPromise
              ? { caption: 'await', color: logPalette.pink }
              : { caption: 'return', color: logPalette.purple },
          ],
          result,
        );
        return resultIsPromise
          ? new Promise((resolve, reject) => {
              // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              (result as Promise<unknown>).then(
                excludeFromTimeDelta((result) => {
                  logWithCallBadge(
                    [{ caption: 'resolve', color: logPalette.yellow }],
                    result,
                  );
                  includeInTimeDelta(resolve)(result);
                }),
                excludeFromTimeDelta((reason) => {
                  logWithCallBadge(
                    [{ caption: 'reject', color: logPalette.red }],
                    reason,
                  );
                  includeInTimeDelta(reject)(reason);
                }),
              );
            })
          : result;
      }),
      value,
    );
  },
};
