import { Plugin } from "./log";
import { ColorName } from "./palette";

export interface Label {
  caption: string;
  color?: ColorName;
}

export const labelsSymbol = Symbol("labelsSymbol");

/**
 * A plugin that adds a label to the log message. The argument can be either a
 * caption or an object containing caption and color name.
 *
 * The following will add labels 1, 2 & 3 (displayed in this order):
 *
 * ```ts
 * log.add(label("1"), label("2")).add(label("3"));
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
