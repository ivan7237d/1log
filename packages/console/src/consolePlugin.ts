import { labelsSymbol, palette, Plugin } from "@1log/core";
import { assertNever, pipe } from "antiutils";
import { ansiPalette } from "./ansiPalette";
import { severitySymbol } from "./severity";
import { getTimeDelta } from "./timeDelta";

export type Format = "none" | "css" | "ansi";

const isNode =
  typeof process !== "undefined" &&
  process.versions != null &&
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

const ansiItalic = `\u001B[3m`;

const ansiClear = `\u001B[0m`;

const ansiColor = (color: number) => `\u001B[38;5;${color}m`;

const renderWithCssStyles = (...args: { caption: string; style: string }[]) => [
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
      (timeDelta) => (timeDelta !== undefined ? `+${timeDelta}` : undefined)
    );
    console[severity ?? "log"](
      ...(format === "css"
        ? renderWithCssStyles(
            ...(labels
              ? labels.map(({ caption, color = "blue" }) => ({
                  caption,
                  style: `background: ${palette[color]["600"]}; color: #ffffff; padding: 0 3px`,
                }))
              : []),
            ...(timeDeltaCaption
              ? [{ caption: timeDeltaCaption, style: "font-style: italic" }]
              : [])
          )
        : [
            ...(labels
              ? labels.map(({ caption, color = "blue" }) =>
                  format === "ansi"
                    ? `${ansiColor(ansiPalette[color])}[${caption}]${ansiClear}`
                    : format === "none"
                    ? `[${caption}]`
                    : assertNever(format)
                )
              : []),
            ...(timeDeltaCaption
              ? [
                  format === "ansi"
                    ? `${ansiItalic}${timeDeltaCaption}${ansiClear}`
                    : format === "none"
                    ? `${timeDeltaCaption}`
                    : assertNever(format),
                ]
              : []),
          ]),
      ...data.args
    );
    return data;
  };
};
