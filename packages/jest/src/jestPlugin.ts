import { getInstanceSymbol, labelsSymbol, Plugin } from "@1log/core";
import { formatDuration } from "./formatDuration";
import { getTimeDelta } from "./timeDelta";

export interface Entry {
  labels: string[];
  timeDelta?: number;
  args: unknown[];
}
let buffer: Entry[] = [];

let instanceSymbol = getInstanceSymbol();

const maybeReset = () => {
  const freshInstanceSymbol = getInstanceSymbol();
  if (freshInstanceSymbol !== instanceSymbol) {
    instanceSymbol = freshInstanceSymbol;
    buffer = [];
  }
};

export const jestPlugin = (options?: {
  showDelta?: boolean;
  showLabels?: boolean;
}): Plugin => {
  const showDelta = options?.showDelta ?? true;
  const showLabels = options?.showLabels ?? true;
  return (data) => {
    const timeDelta = showDelta ? getTimeDelta() : undefined;
    maybeReset();
    buffer.push({
      labels: ((showLabels ? data.meta[labelsSymbol] : undefined) ?? []).map(
        ({ caption }) => caption
      ),
      ...(timeDelta !== undefined ? { timeDelta } : {}),
      args: data.args,
    });
    return data;
  };
};

/**
 * When making a value of `buffer` available externally, it is added to this
 * set.
 */
const bufferSet = new WeakSet();

let haveAddedSnapshotSerializer = false;

export const readLog = () => {
  maybeReset();
  if (!haveAddedSnapshotSerializer) {
    expect.addSnapshotSerializer(jestMessagesSerializer);
    haveAddedSnapshotSerializer = true;
  }
  const snapshot = buffer;
  buffer = [];
  bufferSet.add(snapshot);
  return snapshot;
};

type JestPlugin = Parameters<typeof expect.addSnapshotSerializer>[0];
type GetNewPlugin<JestPlugin> = JestPlugin extends { serialize: unknown }
  ? JestPlugin
  : never;
type NewPlugin = GetNewPlugin<JestPlugin>;

const serializeEntries: NewPlugin["serialize"] = (
  val,
  config,
  indentation,
  depth,
  refs,
  printer
) => {
  const entries = val as Entry[];
  const indentationItems = indentation + config.indent;
  return entries.length === 0
    ? "[Empty log]"
    : entries
        .map(({ labels, timeDelta, args }) => {
          const printedArgs = args.map((arg) =>
            printer(arg, config, indentationItems, depth, refs)
          );
          const els = [
            ...labels.map((label) => `[${label}]`),
            ...(timeDelta === undefined
              ? []
              : [`+${formatDuration(timeDelta)}`]),
            ...printedArgs,
          ];
          return els.some((value) => value.includes("\n"))
            ? ">" +
                config.spacingOuter +
                els
                  .map((value) => indentationItems + value)
                  .join(config.spacingInner)
            : [">", ...els].join(" ");
        })
        .join(config.spacingInner + indentation);
};

export const jestMessagesSerializer: NewPlugin = {
  test: (value) => bufferSet.has(value),
  serialize: (val, config, indentation, depth, refs, printer) => {
    const messages = val as Entry[];
    return depth + 1 > config.maxDepth
      ? `[Log]`
      : serializeEntries(
          messages,
          config,
          indentation,
          depth + 1,
          refs,
          printer
        );
  },
};
