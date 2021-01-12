import { SeverityLevel } from '../logger/severityLevel';
import { UniversalPlugin, universalPluginSymbol } from '../logger/plugin';

/**
 * Disables logging. If `false` is provided, disables all messages. If `true` is
 * provided, does nothing. If a severity level is provided, disables a message
 * unless it has this or higher severity.
 */
export const disablePlugin = (
  enabled: SeverityLevel | boolean,
): UniversalPlugin => ({
  type: universalPluginSymbol,
  ...(enabled !== true ? { enabled } : {}),
});
