import { Severity } from "../../logger/severity";
import { severityPlugin } from "./severityPlugin";

/**
 * Shorthand for `severityPlugin(Severity.warn)`.
 */
export const warnPlugin = severityPlugin(Severity.warn);
