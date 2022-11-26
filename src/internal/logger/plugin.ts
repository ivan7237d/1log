import { pipe } from "antiutils";
import memoize from "monomemo";
import { LogBadge, LogHandler } from "./handler";

/**
 * A logger available to proxy plugins.
 */
export interface PluginLogger {
  (badges: LogBadge[], ...data: unknown[]): void;
}

export const pluginSymbol = Symbol("1log plugin");

export enum PluginType {
  Handler,
  Proxy,
  Badge,
  Severity,
}

/**
 * A plugin that handles log messages.
 */
export interface HandlerPlugin {
  [pluginSymbol]: PluginType.Handler;
  handler: LogHandler;
}

/**
 * A plugin that proxies piped values.
 */
export interface ProxyPlugin {
  [pluginSymbol]: PluginType.Proxy;
  /**
   * Determines if the piped value is in the scope of the plugin. If a value
   * matches scopes of multiple plugins, the plugin that was installed last
   * wins.
   */
  scope: (value: unknown) => boolean;
  /**
   * Takes a logger pre-configured with a "create" badge, and returns a function
   * that transforms a value to its proxy.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (log: PluginLogger) => any;
}

/**
 * A plugin that adds a blue-colored badge to log messages. Badges appear in
 * the order that the corresponding plugins were installed.
 */
export interface BadgePlugin {
  [pluginSymbol]: PluginType.Badge;
  caption: string;
}

/**
 * A plugin that sets severity level. When there are multiple plugins of this
 * type, the highest severity wins.
 */
export interface SeverityPlugin {
  [pluginSymbol]: PluginType.Severity;
  severity: number;
}

export type LogPlugin =
  | HandlerPlugin
  | ProxyPlugin
  | BadgePlugin
  | SeverityPlugin;

/**
 * @internal
 */
export interface CombinedPlugin {
  handlers: LogHandler[];
  proxyPlugins: ProxyPlugin[];
  /**
   * Arrays with the same elements are guaranteed to be ===.
   */
  badgeCaptions: string[];
  severity?: number;
}

const appendBadge = memoize(
  (badgeCaptions: string[]) =>
    memoize((caption: string) => [...badgeCaptions, caption], new Map()),
  new WeakMap()
);

/**
 * @internal
 */
export const combinedPluginReducer = (
  accumulator: CombinedPlugin,
  value: LogPlugin
): CombinedPlugin =>
  value[pluginSymbol] === PluginType.Handler
    ? pipe(accumulator, ({ handlers, ...rest }) => ({
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        handlers: [...handlers, (value as HandlerPlugin).handler],
        ...rest,
      }))
    : value[pluginSymbol] === PluginType.Proxy
    ? pipe(accumulator, ({ proxyPlugins, ...rest }) => ({
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        proxyPlugins: [...proxyPlugins, value as ProxyPlugin],
        ...rest,
      }))
    : value[pluginSymbol] === PluginType.Badge
    ? pipe(accumulator, ({ badgeCaptions, ...rest }) => ({
        badgeCaptions: appendBadge(badgeCaptions)(
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          (value as BadgePlugin).caption
        ),
        ...rest,
      }))
    : pipe(accumulator, ({ severity, ...rest }) => ({
        severity:
          severity === undefined ||
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          (value as SeverityPlugin).severity > severity
            ? // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
              (value as SeverityPlugin).severity
            : severity,
        ...rest,
      }));
