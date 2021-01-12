import { SeverityLevel } from '../../logger/severityLevel';
import { severityPlugin } from './severityPlugin';

/**
 * Shorthand for `severityPlugin(SeverityLevel.debug)`.
 */
export const debugPlugin = severityPlugin(SeverityLevel.debug);
