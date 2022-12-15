import { Plugin } from "@1log/core";

export type Severity = "debug" | "info" | "warn" | "error";

export const severitySymbol = Symbol("severitySymbol");

declare module "@1log/core" {
  interface Meta {
    [severitySymbol]?: Severity;
  }
}

/**
 * A plugin that sets severity level.
 */
export const severity =
  (severity: Severity): Plugin =>
  ({ args, meta }) => ({
    args,
    meta: {
      ...meta,
      [severitySymbol]: severity,
    },
  });
