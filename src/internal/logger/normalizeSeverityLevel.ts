import { SeverityLevel } from './severityLevel';

/**
 * @internal
 */
export const normalizeSeverityLevel = (
  value: number | undefined,
): SeverityLevel | undefined =>
  value === undefined
    ? undefined
    : value >= SeverityLevel.error
    ? SeverityLevel.error
    : value >= SeverityLevel.warn
    ? SeverityLevel.warn
    : value >= SeverityLevel.info
    ? SeverityLevel.info
    : SeverityLevel.debug;
