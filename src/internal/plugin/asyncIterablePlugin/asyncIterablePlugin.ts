import { pipe } from 'antiutils';
import { addNumberedBadge } from '../../logger/addNumberedBadge';
import { LogPlugin, pluginSymbol, PluginType } from '../../logger/plugin';
import { increaseStackLevel } from '../../logger/stackLevel';
import {
  excludeFromTimeDelta,
  includeInTimeDelta,
} from '../../logger/timeDelta';
import { logPalette } from '../../logPalette';

/**
 * For a value that satisfies
 *
 * ```
 * value !== undefined &&
 * value !== null &&
 * value[Symbol.asyncIterator]?.() === value
 * ```
 *
 * (e.g. one returned by an async generator function), logs creation, nexts,
 * yields, fulfillments, rejections, and done's.
 */
export const asyncIterablePlugin: LogPlugin = {
  [pluginSymbol]: PluginType.Proxy,
  scope: (value) =>
    value !== undefined &&
    value !== null &&
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    (value as any)[Symbol.asyncIterator]?.() === value,
  transform: (log) => <T>(
    value: AsyncIterableIterator<T>,
  ): AsyncIterableIterator<T> => {
    const addNextBadge = addNumberedBadge('next', logPalette.green);
    return {
      next: excludeFromTimeDelta((...nextArgs) => {
        const logWithNextBadge = addNextBadge(log);
        logWithNextBadge([], ...nextArgs);
        const promise = pipe(
          () => value.next(),
          includeInTimeDelta,
          increaseStackLevel,
        )();
        logWithNextBadge(
          [{ caption: `await`, color: logPalette.pink }],
          promise,
        );
        return new Promise((resolve, reject) => {
          promise.then(
            excludeFromTimeDelta((result) => {
              const { value, done } = result;
              logWithNextBadge(
                [
                  done
                    ? { caption: `done`, color: logPalette.purple }
                    : {
                        caption: `yield`,
                        color: logPalette.yellow,
                      },
                ],
                value,
              );
              includeInTimeDelta(resolve)(result);
            }),
            excludeFromTimeDelta((reason) => {
              logWithNextBadge(
                [{ caption: 'reject', color: logPalette.red }],
                reason,
              );
              includeInTimeDelta(reject)(reason);
            }),
          );
        });
      }),
      [Symbol.asyncIterator]: function () {
        return this;
      },
    };
  },
};
