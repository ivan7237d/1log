import { UniversalPlugin, universalPluginSymbol } from '../../logger/plugin';

/**
 * Sets severity level. If multiple plugins set severity level, the highest
 * severity wins.
 */
export const severityPlugin = (severityLevel: number): UniversalPlugin => ({
  type: universalPluginSymbol,
  severityLevel,
});
