import { memoizeStrong, memoizeWeak } from 'antiutils';
import { PluginLogger } from './plugin';

let getIndex: (log: PluginLogger) => (captionBase: string) => () => number;

export const resetBadgeNumbers = (): void => {
  getIndex = memoizeWeak(() =>
    memoizeStrong(() => {
      let counter = 0;
      return () => ++counter;
    }),
  );
};

resetBadgeNumbers();

/**
 * Prefixes the first log message with a badge captioned
 *
 * ```
 * <caption base> <number>
 * ```
 *
 * and prefixes subsequent log messages with a badge captioned
 *
 * ```
 * <same number>
 * ```
 *
 * if colors can be displayed, or
 *
 * ```
 * <caption base> <number>
 * ```
 *
 * otherwise. The number is computed by incrementing a counter specific to each
 * combination of logger function and caption base.
 */
export const addNumberedBadge = (
  captionBase: string,
  /**
   * The same format as in `LogBadge`.
   */
  color: string,
): ((log: PluginLogger) => PluginLogger) => (log) => {
  let index: number | undefined = undefined;
  return (badges, ...args) => {
    if (index === undefined) {
      index = getIndex(log)(captionBase)();
      return log(
        [{ caption: `${captionBase} ${index}`, color }, ...badges],
        ...args,
      );
    }
    return log(
      [
        {
          caption: `${index}`,
          color,
          captionNoColor: `${captionBase} ${index}`,
        },
        ...badges,
      ],
      ...args,
    );
  };
};
