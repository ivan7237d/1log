import { applyPipe } from 'antiutils';
import { LogPlugin, pluginSymbol, PluginType } from '../logger/plugin';
import { increaseStackLevel } from '../logger/stackLevel';
import { excludeFromTimeDelta, includeInTimeDelta } from '../logger/timeDelta';
import { logPalette } from '../logPalette';

/**
 * For a value that satisfies
 *
 * ```
 * value !== undefined &&
 * value !== null &&
 * value[Symbol.iterator]?.() === value
 * ```
 *
 * (e.g. one returned by a generator function or methods `entries`, `keys`,
 * `values` of `Map` and `Set`), logs creation, nexts, yields, and done's.
 */
export const iterableIteratorPlugin: LogPlugin = {
  [pluginSymbol]: PluginType.Proxy,
  scope: (value) =>
    value !== undefined &&
    value !== null &&
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    (value as any)[Symbol.iterator]?.() === value,
  transform: (log) => <T>(
    iterator: IterableIterator<T>,
  ): IterableIterator<T> => ({
    next: excludeFromTimeDelta(() => {
      log([{ caption: `next`, color: logPalette.green }]);
      const result = applyPipe(
        () => iterator.next(),
        includeInTimeDelta,
        increaseStackLevel,
      )();
      const { value, done } = result;
      log(
        [
          done
            ? { caption: `done`, color: logPalette.purple }
            : {
                caption: `yield`,
                color: logPalette.pink,
              },
        ],
        value,
      );
      return result;
    }),
    [Symbol.iterator]: function () {
      return this;
    },
  }),
};
