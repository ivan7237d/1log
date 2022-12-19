import { Label, labelsSymbol } from "./label";

export interface Meta {
  [labelsSymbol]?: Label[];
}

export interface Data {
  args: unknown[];
  meta: Meta;
}

export interface Plugin {
  (data: Data): Data;
}

export interface Log {
  <Args extends unknown[]>(...args: Args): Args extends [...unknown[], infer T]
    ? T
    : Args extends []
    ? void
    : Args[number] | void;
  /**
   * Immutably adds plugins.
   *
   * The last plugin added/listed is called first:
   *
   * ```ts
   * log.add(called3rd).add(called2nd, called1rst);
   * ```
   */
  add: (...plugins: Plugin[]) => Log;
}

const getLog = (plugins: Plugin[]): Log =>
  Object.assign(
    (...args: unknown[]) => {
      plugins.reduceRight<Data>((data, plugin) => plugin(data), {
        args,
        meta: {},
      });
      return args[args.length - 1] as any;
    },
    {
      add: (...extraPlugins: Plugin[]) => getLog([...plugins, ...extraPlugins]),
    }
  );

export const voidLog: Log = getLog([]);
