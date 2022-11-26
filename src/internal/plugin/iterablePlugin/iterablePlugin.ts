import { pipe } from "antiutils";
import { addNumberedBadge } from "../../logger/addNumberedBadge";
import { LogPlugin, pluginSymbol, PluginType } from "../../logger/plugin";
import { increaseStackLevel } from "../../logger/stackLevel";
import {
  excludeFromTimeDelta,
  includeInTimeDelta,
} from "../../logger/timeDelta";
import { logPalette } from "../../logPalette";

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
export const iterablePlugin: LogPlugin = {
  [pluginSymbol]: PluginType.Proxy,
  scope: (value) =>
    value !== undefined &&
    value !== null &&
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
    (value as any)[Symbol.iterator]?.() === value,
  transform:
    (log) =>
    <T>(iterator: IterableIterator<T>): IterableIterator<T> => {
      const addNextBadge = addNumberedBadge("next", logPalette.green);
      return {
        next: excludeFromTimeDelta((...nextArgs) => {
          const logWithNextBadge = addNextBadge(log);
          logWithNextBadge([], ...nextArgs);
          const result = pipe(
            () => iterator.next(...nextArgs),
            includeInTimeDelta,
            increaseStackLevel
          )();
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
            value
          );
          return result;
        }),
        [Symbol.iterator]: function () {
          return this;
        },
      };
    },
};
