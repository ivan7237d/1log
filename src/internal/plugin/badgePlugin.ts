import { BadgePlugin, pluginSymbol, PluginType } from "../logger/plugin";

/**
 * Adds a blue-colored badge to log messages. Badges appear in the order that
 * the corresponding plugins were installed.
 */
export const badgePlugin = (caption: string): BadgePlugin => ({
  [pluginSymbol]: PluginType.Badge,
  caption,
});
