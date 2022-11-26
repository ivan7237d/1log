import { pipe } from "antiutils";
import memoize from "monomemo";
import { addNumberedBadge } from "./addNumberedBadge";
import { LogMessage } from "./handler";
import {
  CombinedPlugin,
  combinedPluginReducer,
  LogPlugin,
  PluginLogger,
  pluginSymbol,
} from "./plugin";
import { getStackLevel } from "./stackLevel";
import { systemPalette } from "./systemPalette";
import { excludeFromTimeDelta, getTimeDelta } from "./timeDelta";

/**
 * Combined globally installed plugins.
 */
let globalCombinedPlugin: CombinedPlugin = {
  handlers: [],
  proxyPlugins: [],
  badgeCaptions: [],
};

/**
 * Globally installs plugins.
 */
export const installPlugins = (...plugins: LogPlugin[]): void => {
  globalCombinedPlugin = plugins.reduce(
    combinedPluginReducer,
    globalCombinedPlugin
  );
};

const getBadges = memoize(
  (badgeCaptions: string[]) =>
    badgeCaptions.map((caption) => ({ caption, color: systemPalette.blue })),
  new WeakMap()
);

const getPluginLogger =
  (combinedPlugin: CombinedPlugin): PluginLogger =>
  (badges, ...data) => {
    const message: LogMessage = {
      severity: combinedPlugin.severity,
      stackLevel: getStackLevel(),
      badges: [...getBadges(combinedPlugin.badgeCaptions), ...badges],
      timeDelta: getTimeDelta(),
      data,
    };
    combinedPlugin.handlers.forEach((handler) => handler(message));
  };

const addCreateBadge = memoize(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (badgeCaptions: string[]) => addNumberedBadge("create", systemPalette.gray),
  new WeakMap()
);

export interface Logger {
  <Parameters extends unknown[]>(...args: Parameters): Parameters extends [
    LogPlugin
  ]
    ? Logger
    : Parameters extends [infer T]
    ? T
    : void;
}

/**
 * Used by `logLocal`.
 */
const logLocalInternalArgs = new WeakSet();

/**
 * Implements `Logger`, but also optionally takes at first position an argument
 * of type `CombinedPlugin` which is marked as internal by adding it to
 * `logLocalInternalArgs` WeakSet.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logLocal = (...args: any[]): any => {
  const [combinedPlugin = globalCombinedPlugin, externalArgs]: [
    CombinedPlugin,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any[]
  ] = pipe(args[0], (value) =>
    logLocalInternalArgs.has(value) ? [value, args.slice(1)] : [undefined, args]
  );
  const pluginLogger = getPluginLogger(combinedPlugin);
  if (externalArgs.length === 1) {
    const externalArg = externalArgs[0];
    if (externalArg?.[pluginSymbol] !== undefined) {
      const plugin: LogPlugin = externalArg;
      const newCombinedPlugin = combinedPluginReducer(combinedPlugin, plugin);
      logLocalInternalArgs.add(newCombinedPlugin);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return excludeFromTimeDelta((...args: any[]) =>
        logLocal(newCombinedPlugin, ...args)
      );
    }
    const proxyPlugin = [...combinedPlugin.proxyPlugins]
      .reverse()
      .find((plugin) => plugin.scope(externalArg));
    if (proxyPlugin !== undefined) {
      const logWithCreate = addCreateBadge(combinedPlugin.badgeCaptions)(
        pluginLogger
      );
      logWithCreate([], externalArg);
      return proxyPlugin.transform(logWithCreate)(externalArg);
    }
    pluginLogger([], externalArg);
    return externalArg;
  }
  pluginLogger([], ...externalArgs);
};

/**
 * Logs a value, or if a plugin is passed as argument, returns another logger.
 * If there is 1 agrument and it's not a plugin, returns the argument possibly
 * proxied by a plugin.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const log = excludeFromTimeDelta(logLocal) as Logger;
