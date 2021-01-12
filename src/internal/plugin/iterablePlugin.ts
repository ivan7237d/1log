import { applyPipe } from 'antiutils';
import { addNumberedBadge } from '../logger/addNumberedBadge';
import { ClosingPlugin, closingPluginSymbol } from '../logger/plugin';
import { logPalette } from '../logPalette';
import { excludeFromTimeDelta, includeInTimeDelta } from '../logger/timeDelta';

/**
 * For an iterable, logs creation, calls, nexts, yields, and completions.
 */
export const iterablePlugin: ClosingPlugin<<T>(
  value: Iterable<T>,
) => Iterable<T>> = {
  type: closingPluginSymbol,
  transform: (log) => (value) => ({
    [Symbol.iterator]: excludeFromTimeDelta(() => {
      const logWithCall = applyPipe(
        log,
        addNumberedBadge('call', logPalette.green),
      );
      const increaseStackLevel = logWithCall([]);
      const iterator = applyPipe(
        () => value[Symbol.iterator](),
        includeInTimeDelta,
        increaseStackLevel,
      )();
      return {
        next: excludeFromTimeDelta(() => {
          const increaseStackLevel = logWithCall([
            { caption: `next`, color: logPalette.yellow },
          ]);
          const result = applyPipe(
            () => iterator.next(),
            includeInTimeDelta,
            increaseStackLevel,
          )();
          if (result.done) {
            logWithCall([{ caption: `done`, color: logPalette.purple }]);
          } else {
            logWithCall(
              [
                {
                  caption: `yield`,
                  color: logPalette.orange,
                },
              ],
              result.value,
            );
          }
          return result;
        }),
      };
    }),
  }),
};
