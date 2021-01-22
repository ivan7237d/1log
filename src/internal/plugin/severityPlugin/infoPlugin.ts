import { Severity } from '../../logger/severity';
import { severityPlugin } from './severityPlugin';

/**
 * Shorthand for `severityPlugin(Severity.info)`.
 */
export const infoPlugin = severityPlugin(Severity.info);
