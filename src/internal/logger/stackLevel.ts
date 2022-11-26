let stackLevel = 0;

/**
 * Increments stack level for messages that are synchronously logged by the
 * callback.
 */
export const increaseStackLevel =
  <CallbackParameters extends unknown[], CallbackResult>(
    callback: (...args: CallbackParameters) => CallbackResult
  ) =>
  (...args: CallbackParameters): CallbackResult => {
    stackLevel++;
    try {
      return callback(...args);
    } finally {
      stackLevel--;
    }
  };

/**
 * @internal
 */
export const getStackLevel = (): number => stackLevel;
