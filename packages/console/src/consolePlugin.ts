import { labelsSymbol, palette, Plugin } from "@1log/core";
import { assertNever, pipe } from "antiutils";
import { ansiPalette } from "./ansiPalette";
import { formatDuration } from "./formatDuration";
import { severitySymbol } from "./severity";
import { getTimeDelta } from "./timeDelta";

export type Format = "none" | "css" | "ansi";

const isNode =
  typeof process !== "undefined" &&
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  process.versions != null &&
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  process.versions.node != null;

const isDeno =
  // @ts-ignore
  typeof Deno !== "undefined" &&
  // @ts-ignore
  typeof Deno.version !== "undefined" &&
  // @ts-ignore
  typeof Deno.version.deno !== "undefined";

const isBun = !!(
  typeof process !== "undefined" &&
  // @ts-ignore
  process.isBun
);

const ansiBold = `\u001B[1m`;

const ansiClear = `\u001B[0m`;

const ansiColor = (color: number) => `\u001B[38;5;${color}m`;

const renderWithCssStyles = (...args: { caption: string; style: string }[]) =>
  args.length === 0
    ? []
    : [
        args.map(({ caption }) => `%c${caption}%c`).join(" "),
        ...args.flatMap(({ style }) => [style, ""]),
      ];

export const consolePlugin = (options?: {
  showDelta?: boolean;
  showLabels?: boolean;
  format?: Format;
}): Plugin => {
  const showDelta = options?.showDelta ?? true;
  const showLabels = options?.showLabels ?? true;
  const format =
    options?.format ?? (isNode || isDeno || isBun ? "ansi" : "css");
  return (data) => {
    const severity = data.meta[severitySymbol];
    const labels = showLabels ? data.meta[labelsSymbol] : undefined;
    const timeDeltaCaption = pipe(
      showDelta ? getTimeDelta() : undefined,
      (timeDelta) =>
        timeDelta !== undefined ? `+${formatDuration(timeDelta)}` : undefined
    );
    console[severity ?? "log"](
      ...(format === "css"
        ? renderWithCssStyles(
            ...(labels
              ? labels.map(({ caption, color = "blue" }) => ({
                  caption: `[${caption}]`,
                  style: `color: ${palette[color]["600"]}`,
                }))
              : []),
            ...(timeDeltaCaption
              ? [{ caption: timeDeltaCaption, style: "font-weight: bold" }]
              : [])
          )
        : [
            ...(labels
              ? labels.map(({ caption, color = "blue" }): string =>
                  format === "ansi"
                    ? `${ansiColor(ansiPalette[color])}[${caption}]${ansiClear}`
                    : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    format === "none"
                    ? `[${caption}]`
                    : assertNever()
                )
              : []),
            ...(timeDeltaCaption
              ? [
                  format === "ansi"
                    ? `${ansiBold}${timeDeltaCaption}${ansiClear}`
                    : // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    format === "none"
                    ? `${timeDeltaCaption}`
                    : assertNever(),
                ]
              : []),
          ]),
      ...data.args
    );
    return data;
  };
};
