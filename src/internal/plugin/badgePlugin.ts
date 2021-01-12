import { UniversalPlugin, universalPluginSymbol } from '../logger/plugin';

/**
 * Prefixes messages with a blue-colored badge.
 */
export const badgePlugin = (badge: string): UniversalPlugin => ({
  type: universalPluginSymbol,
  badge,
});
