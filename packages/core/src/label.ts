import { Plugin } from "./log";
import { ColorName } from "./palette";

export interface Label {
  caption: string;
  color?: ColorName;
}

export const labelsSymbol = Symbol("labelsSymbol");

/**
 * A plugin that adds an object of shape `{caption: string; color?: ColorName}`
 * (`Label`) to the top of `meta[labelsSymbol]` array. The argument can be
 * either a caption or an object containing caption and color name.
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
