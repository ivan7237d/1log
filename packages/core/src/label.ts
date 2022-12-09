import { Plugin } from "./log";
import { ColorName } from "./palette";

export interface Label {
  caption: string;
  color?: ColorName;
}

export const labels = Symbol("labels");

declare module "./log" {
  interface Meta {
    [labels]?: Label[];
  }
}

export const label =
  (arg: string | Label): Plugin =>
  ({ args, meta }) => ({
    args,
    meta: {
      ...meta,
      [labels]: [
        typeof arg === "string" ? { caption: arg } : arg,
        ...(meta[labels] ?? []),
      ],
    },
  });
