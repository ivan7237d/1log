import { Severity } from "./severity";

const severities = new Set<number | undefined>([
  Severity.debug,
  Severity.info,
  Severity.warn,
  Severity.error,
]);

/**
 * @internal
 */
export const normalizeSeverity = (
  value: number | undefined
): Severity | undefined => (severities.has(value) ? value : undefined);
