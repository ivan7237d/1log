import { Plugin } from "./log";

const testPluginSymbol = Symbol("testPluginSymbol");

declare module "./log" {
  interface Meta {
    [testPluginSymbol]?: string;
  }
}

/**
 * A plugin used by this package in tests.
 */
export const testPlugin =
  (suffix: string): Plugin =>
  ({ args, meta }) => {
    // @ts-expect-error
    meta.attrDoesNotExist;
    // $ExpectType string | undefined
    const pluginMeta = meta[testPluginSymbol];
    return {
      args: [...args, suffix],
      meta: { ...meta, [testPluginSymbol]: (pluginMeta ?? "") + suffix },
    };
  };
