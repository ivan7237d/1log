/**
 * Has the value of `undefined` while we're not counting time towards delta.
 */
let lastTime: number | undefined = 0;

let timeDelta = 0;

if (typeof performance === 'undefined') {
  // Polyfill `performance` for Node. We can't use a poNyfill because we need to
  // leave to the user ability to stub out the `performance` object for the
  // purposes of unit tests. We use eval to prevent Webpack from noticing this
  // import.
  global.performance = eval('require')('perf_hooks').performance;
}

/**
 * Returns time delta from the last time this function was called or for the
 * first call, the time since the page was loaded or the node process was
 * started.
 *
 * @internal
 */
export const getTimeDelta = (): number => {
  if (lastTime !== undefined) {
    throw new Error(
      `getTimeDelta cannot be called while we're counting time towards delta.`,
    );
  }
  try {
    return timeDelta;
  } finally {
    timeDelta = 0;
  }
};

/**
 * Excludes callback execution time from delta.
 */
export const excludeFromTimeDelta = <
  CallbackParameters extends unknown[],
  CallbackResult
>(
  callback: (...args: CallbackParameters) => CallbackResult,
) => (...args: CallbackParameters): CallbackResult => {
  const timestamp = performance.now();
  if (lastTime === undefined) {
    return callback(...args);
  } else {
    timeDelta += timestamp - lastTime;
    lastTime = undefined;
    try {
      return callback(...args);
    } finally {
      lastTime = performance.now();
    }
  }
};

/**
 * Includes callback execution time into delta.
 */
export const includeInTimeDelta = <
  CallbackParameters extends unknown[],
  CallbackResult
>(
  callback: (...args: CallbackParameters) => CallbackResult,
) => (...args: CallbackParameters): CallbackResult => {
  if (lastTime !== undefined) {
    return callback(...args);
  } else {
    try {
      lastTime = performance.now();
      return callback(...args);
    } finally {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      timeDelta += performance.now() - lastTime!;
      lastTime = undefined;
    }
  }
};

/**
 * For use in tests when switching between real and fake timers.
 */
export const resetTimeDelta = (): void => {
  if (lastTime === undefined) {
    throw new Error(
      `resetTimeDelta cannot be called while we're not counting time towards delta.`,
    );
  }
  lastTime = performance.now();
  timeDelta = 0;
};
