import { Severity } from '../../logger/severity';
import { severityPlugin } from './severityPlugin';

/**
 * Shorthand for `severityPlugin(Severity.debug)`.
 */
export const debugPlugin = severityPlugin(Severity.debug);
