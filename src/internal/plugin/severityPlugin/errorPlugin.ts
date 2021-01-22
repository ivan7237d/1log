import { Severity } from '../../logger/severity';
import { severityPlugin } from './severityPlugin';

/**
 * Shorthand for `severityPlugin(Severity.error)`.
 */
export const errorPlugin = severityPlugin(Severity.error);
