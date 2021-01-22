import { PluginLogger } from './plugin';

/**
 * Counters are specific to an era.
 */
let era = Symbol();

export const resetBadgeNumbers = (): void => {
  era = Symbol();
};

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
 * outer function call.
 */
export const addNumberedBadge = (
  captionBase: string,
  /**
   * The same format as in `LogBadge`.
   */
  color: string,
): ((log: PluginLogger) => PluginLogger) => {
  let eraLocal: symbol;
  let counter: number;
  return (log) => {
    let index: number | undefined = undefined;
    return (badges, ...args) => {
      if (index === undefined) {
        if (eraLocal !== era) {
          eraLocal = era;
          counter = 0;
        }
        index = ++counter;
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
};
