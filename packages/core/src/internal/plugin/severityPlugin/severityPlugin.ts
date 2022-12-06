import { pluginSymbol, PluginType, SeverityPlugin } from "../../logger/plugin";

/**
 * Sets severity level. If multiple plugins set severity level, the highest
 * severity wins.
 */
export const severityPlugin = (severity: number): SeverityPlugin => ({
  [pluginSymbol]: PluginType.Severity,
  severity,
});
