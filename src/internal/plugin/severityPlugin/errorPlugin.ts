import { SeverityLevel } from '../../logger/severityLevel';
import { severityPlugin } from './severityPlugin';

/**
 * Shorthand for `severityPlugin(SeverityLevel.error)`.
 */
export const errorPlugin = severityPlugin(SeverityLevel.error);
