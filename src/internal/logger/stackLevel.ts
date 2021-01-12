/**
 * Stores current stack level for each severity level and for undefined severity
 * level.
 */
const stackLevels = new Map<number | undefined, number>();

/**
 * @internal
 */
export const increaseStackLevel = (severityLevel: number | undefined) => <
  CallbackParameters extends unknown[],
  CallbackResult
>(
  callback: (...args: CallbackParameters) => CallbackResult,
) => (...args: CallbackParameters): CallbackResult => {
  stackLevels.set(severityLevel, (stackLevels.get(severityLevel) ?? 0) + 1);
  try {
    return callback(...args);
  } finally {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    stackLevels.set(severityLevel, stackLevels.get(severityLevel)! - 1);
  }
};

/**
 * @internal
 */
export const getStackLevel = (severityLevel: number | undefined): number =>
  stackLevels.get(severityLevel) ?? 0;
