import { SeverityLevel } from '../../logger/severityLevel';
import { severityPlugin } from './severityPlugin';

/**
 * Shorthand for `severityPlugin(SeverityLevel.warn)`.
 */
export const warnPlugin = severityPlugin(SeverityLevel.warn);
