import { Plugin } from "./log";
import { ColorName } from "./palette";

export interface Label {
  caption: string;
  color?: ColorName;
}

export const labelsSymbol = Symbol("labelsSymbol");

declare module "./log" {
  interface Meta {
    [labelsSymbol]?: Label[];
  }
}

/**
 * A plugin that adds a label to the log message. The argument can be either a
 * caption or an object containing caption and color name.
 *
 * The following will add labels 1 & 2 (in this order):
 *
 * ```ts
 * log.add(label("label 1")).add(label("label 2"));
 * ```
 */
export const label =
  (arg: string | Label): Plugin =>
  ({ args, meta }) => ({
    args,
    meta: {
      ...meta,
      [labelsSymbol]: [
        typeof arg === "string" ? { caption: arg } : arg,
        ...(meta[labelsSymbol] ?? []),
      ],
    },
  });
