import {
  applyPipe,
  as,
  asContext,
  deleteFromMap,
  flatMapIterable,
  memoizeStrong,
  memoizeWeak,
  reduceIterable,
  reverseArray,
  setInMap,
} from 'antiutils';
import { addNumberedBadge } from './addNumberedBadge';
import { LogHandler } from './handler';
import {
  ClosingPlugin,
  closingPluginSymbol,
  CombinedUniversalPlugin,
  GlobalPlugin,
  globalPluginSymbol,
  internalDisablePlugin,
  PluginLogger,
  UniversalPlugin,
  universalPluginReducer,
  universalPluginSymbol,
} from './plugin';
import { getStackLevel, increaseStackLevel } from './stackLevel';
import { systemPalette } from './systemPalette';
import { excludeFromTimeDelta, getTimeDelta } from './timeDelta';

let installedPlugins = new Map<symbol, GlobalPlugin | UniversalPlugin>();

/**
 * Globally installs a plugin. Returns a function that uninstalls the plugin.
 */
export const installPlugin = (
  plugin: GlobalPlugin | UniversalPlugin,
): (() => void) => {
  const symbol = Symbol();
  installedPlugins = applyPipe(
    installedPlugins,
    setInMap(asContext(symbol), plugin),
  );
  return () => {
    installedPlugins = applyPipe(
      installedPlugins,
      deleteFromMap(asContext(symbol)),
    );
  };
};

/**
 * Given currently installed plugins, returns a value representing a combination
 * of the installed `UniversalPlugin`s and 0 or more additional
 * `UniversalPlugin`s.
 */
interface CurrentCombinedUniversalPlugin {
  (value: typeof installedPlugins):
    | CombinedUniversalPlugin
    | typeof internalDisablePlugin;
}

const getInstalledCombinedUniversalPlugin: CurrentCombinedUniversalPlugin = memoizeWeak(
  (plugins) =>
    applyPipe(
      plugins.values(),
      flatMapIterable((plugin) =>
        plugin.type === universalPluginSymbol ? [plugin] : [],
      ),
      reduceIterable(
        (accumulator, value) =>
          accumulator === internalDisablePlugin
            ? undefined
            : universalPluginReducer(accumulator, value),
        as<CombinedUniversalPlugin | typeof internalDisablePlugin>({
          badges: [],
        }),
      ),
    ),
);

const getInstalledHandlers = memoizeWeak(
  (plugins: typeof installedPlugins): LogHandler[] => [
    ...applyPipe(
      plugins.values(),
      flatMapIterable((value) =>
        value.type === globalPluginSymbol && value.handler !== undefined
          ? [value.handler]
          : [],
      ),
    ),
  ],
);

const getInstalledPluginLogger = memoizeStrong(
  (severityLevel: number | undefined): PluginLogger => (badges, ...data) => {
    const message = {
      severityLevel,
      stackLevel: getStackLevel(severityLevel),
      badges,
      timeDelta: getTimeDelta(),
      data,
    };
    for (const handler of getInstalledHandlers(installedPlugins)) {
      handler(message);
    }
    return increaseStackLevel(severityLevel);
  },
);

const addBadgeToPluginLogger = memoizeWeak((log: PluginLogger) =>
  memoizeStrong(
    (caption: string): PluginLogger => (badges, ...args) =>
      log([{ caption, color: systemPalette.blue }, ...badges], ...args),
  ),
);

const getPluginLogger = (
  currentCombinedUniversalPlugin: CurrentCombinedUniversalPlugin,
) =>
  applyPipe(
    currentCombinedUniversalPlugin(installedPlugins),
    (combinedUniversalPlugin) =>
      combinedUniversalPlugin !== internalDisablePlugin
        ? applyPipe(
            combinedUniversalPlugin,
            ({ badges, enabled, severityLevel }) =>
              getInstalledHandlers(installedPlugins).length !== 0 &&
              (enabled === undefined ||
                (severityLevel !== undefined && severityLevel >= enabled))
                ? badges.reduce(
                    (log, caption) => addBadgeToPluginLogger(log)(caption),
                    getInstalledPluginLogger(severityLevel),
                  )
                : undefined,
          )
        : undefined,
  );

const addCreateBadge = addNumberedBadge('create', systemPalette.gray);

const getInstalledProxies = memoizeWeak((plugins: typeof installedPlugins) =>
  applyPipe(
    plugins.values(),
    flatMapIterable((value) =>
      value.type === globalPluginSymbol && value.proxy !== undefined
        ? [value.proxy]
        : [],
    ),
    (value) => [...value],
    reverseArray,
  ),
);

export interface Logger {
  <Parameters extends unknown[]>(...args: Parameters): Parameters extends [
    UniversalPlugin,
  ]
    ? Logger
    : Parameters extends [ClosingPlugin<infer T>]
    ? T
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
 * of type `CurrentCombinedUniversalPlugin` which is marked as internal by
 * adding it to `logLocalInternalArgs` WeakSet.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const logLocal = (...args: any[]): any => {
  const [internalArg = getInstalledCombinedUniversalPlugin, externalArgs]: [
    CurrentCombinedUniversalPlugin,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any[],
  ] = applyPipe(args[0], (value) =>
    logLocalInternalArgs.has(value)
      ? [value, args.slice(1)]
      : [undefined, args],
  );
  if (externalArgs.length === 1) {
    const externalArg = externalArgs[0];
    if (externalArg?.type === universalPluginSymbol) {
      const universalPlugin: UniversalPlugin = externalArg;
      const newInternalArg = memoizeWeak((value: typeof installedPlugins) =>
        applyPipe(internalArg(value), (value) =>
          value === internalDisablePlugin
            ? internalDisablePlugin
            : universalPluginReducer(value, universalPlugin),
        ),
      );
      logLocalInternalArgs.add(newInternalArg);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return excludeFromTimeDelta((...args: any[]) =>
        logLocal(newInternalArg, ...args),
      );
    }
    if (externalArg?.type === closingPluginSymbol) {
      const { transform }: ClosingPlugin<unknown> = externalArg;
      return excludeFromTimeDelta((value) => {
        const log = getPluginLogger(internalArg);
        if (log === undefined) {
          return value;
        }
        const logWithCreate = addCreateBadge(log);
        logWithCreate([], value);
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, @typescript-eslint/no-explicit-any
        return (transform as any)(logWithCreate)(value);
      });
    }
    const log = getPluginLogger(internalArg);
    if (log === undefined) {
      return externalArg;
    }
    const { value, done } = applyPipe(
      getInstalledProxies(installedPlugins),
      reduceIterable(
        ({ value, done }, { scope, transform }) =>
          done
            ? undefined
            : scope(value)
            ? {
                value: (() => {
                  const logWithCreate = addCreateBadge(log);
                  logWithCreate([], value);
                  return transform(logWithCreate)(value);
                })(),
                done: true,
              }
            : { value, done },
        { value: externalArg, done: false },
      ),
    );
    if (!done) {
      log([], externalArg);
    }
    return value;
  }
  getPluginLogger(internalArg)?.([], ...externalArgs);
};

/**
 * Logs a value, or if a plugin is passed as argument, returns another logger.
 * If there is 1 agrument and it's not a plugin, returns the argument possibly
 * transformed by a plugin.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const log = excludeFromTimeDelta(logLocal) as Logger;
