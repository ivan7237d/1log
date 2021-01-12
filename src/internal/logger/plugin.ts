import { applyPipe, as, reduceIterable } from 'antiutils';
import { LogBadge, LogHandler } from './handler';

/**
 * Type of the value returned by `PluginLogger`.
 */
export interface PluginLoggerResult {
  <CallbackParameters extends unknown[], CallbackResult>(
    callback: (...args: CallbackParameters) => CallbackResult,
  ): (...args: CallbackParameters) => CallbackResult;
}

/**
 * Logs a message and returns a function that can be used to wrap a callback to
 * increment stack level of messages synchronously logged by that callback.
 */
export interface PluginLogger {
  (badges: LogBadge[], ...data: unknown[]): PluginLoggerResult;
}

export const globalPluginSymbol = Symbol();

/**
 * A plugin that can be only used with `installPlugin`.
 */
export interface GlobalPlugin {
  type: typeof globalPluginSymbol;
  /**
   * At least one plugin with this property must be installed by the time `log`
   * is called.
   */
  handler?: LogHandler;
  proxy?: {
    /**
     * Determines if the piped value is in the scope of the plugin.
     */
    scope: (value: unknown) => boolean;
    /**
     * Takes a logger with "create" badge added, and returns a function whose
     * type is a subtype of the identity function. This function will be used to
     * transform the piped value if the value is in scope and logging is
     * enabled. If a value matches scopes of multiple plugins, the plugin that
     * was installed last wins.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform: (log: PluginLogger) => any;
  };
}

export const universalPluginSymbol = Symbol();

/**
 * A plugin that can be used with both `installPlugin` and `log`.
 */
export interface UniversalPlugin {
  type: typeof universalPluginSymbol;

  /**
   * A badge to prefix the message with.
   */
  badge?: string;

  /**
   * Sets severity level. If multiple plugins set severity level, the highest
   * severity wins.
   */
  severityLevel?: number;

  /**
   * Disables logging of a message, either irrespective of severity level
   * (`false`), or unless the message has a certain severity level or higher.
   */
  enabled?: false | number;
}

export const closingPluginSymbol = Symbol();

/**
 * A plugin that can only be used with `log`. If it is used, no other plugins
 * can be passed to the resulting log function.
 */
export interface ClosingPlugin<T> {
  type: typeof closingPluginSymbol;

  /**
   * Takes a logger with "create" badge added, and returns a function whose type
   * is a subtype of the identity function. This function will be used to
   * transform the piped value if logging is enabled.
   */
  transform: (log: PluginLogger) => T;
}

/**
 * A plugin that disables logging.
 *
 * @internal
 */
export const internalDisablePlugin = Symbol();

/**
 * A combination of 0 or more universal plugins.
 *
 * @internal
 */
export interface CombinedUniversalPlugin {
  badges: string[];
  severityLevel?: number;
  enabled?: number;
}

const badgeReducer = (
  accumulator: CombinedUniversalPlugin,
  value: UniversalPlugin['badge'],
): CombinedUniversalPlugin =>
  value === undefined
    ? accumulator
    : applyPipe(accumulator, ({ badges, ...rest }) => ({
        badges: [...badges, value],
        ...rest,
      }));

const severityLevelReducer = (
  accumulator: CombinedUniversalPlugin,
  value: UniversalPlugin['severityLevel'],
): CombinedUniversalPlugin =>
  value === undefined
    ? accumulator
    : applyPipe(accumulator, ({ severityLevel, enabled, ...rest }) => ({
        severityLevel:
          severityLevel === undefined || value > severityLevel
            ? value
            : severityLevel,
        enabled,
        ...rest,
      }));

const enabledReducer = (
  accumulator: CombinedUniversalPlugin,
  value: UniversalPlugin['enabled'],
): CombinedUniversalPlugin | typeof internalDisablePlugin =>
  value === undefined
    ? accumulator
    : value === false
    ? internalDisablePlugin
    : applyPipe(accumulator, ({ enabled: accumulator, ...rest }) => ({
        enabled:
          accumulator === undefined ? value : Math.max(accumulator, value),
        ...rest,
      }));

interface UniversalPluginReducer {
  (accumulator: CombinedUniversalPlugin, value: UniversalPlugin):
    | CombinedUniversalPlugin
    | typeof internalDisablePlugin;
}

/**
 * @internal
 */
export const universalPluginReducer: UniversalPluginReducer = (
  accumulator,
  value,
) =>
  applyPipe(
    as<UniversalPluginReducer[]>([
      (accumulator, value) =>
        severityLevelReducer(accumulator, value.severityLevel),
      (accumulator, value) => enabledReducer(accumulator, value.enabled),
      (accumulator, value) => badgeReducer(accumulator, value.badge),
    ]),
    reduceIterable(
      (accumulator, reducer) =>
        accumulator === internalDisablePlugin
          ? undefined
          : reducer(accumulator, value),
      as<CombinedUniversalPlugin | typeof internalDisablePlugin>(accumulator),
    ),
  );
