import { SeverityLevel } from '../../logger/severityLevel';
import { severityPlugin } from './severityPlugin';

/**
 * Shorthand for `severityPlugin(SeverityLevel.info)`.
 */
export const infoPlugin = severityPlugin(SeverityLevel.info);
