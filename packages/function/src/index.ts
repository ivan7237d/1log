import { getInstanceSymbol, label, Log } from "@1log/core";
import { getLogPromise } from "@1log/promise";
import { pipe } from "antiutils";

type Options = {
  labelCaption?: string;
  filter?: Iterable<"call" | "return" | "throw">;
};

type OptionsOrLabelCaption = string | Options;

interface LogFunction {
  <Args extends unknown[], Retval>(
    optionsOrLabelCaption: OptionsOrLabelCaption,
    f: (...args: Args) => Retval
  ): (...args: Args) => Retval;
  <Args extends unknown[], Retval>(f: (...args: Args) => Retval): (
    ...args: Args
  ) => Retval;
  (optionsOrLabelCaption: OptionsOrLabelCaption): <
    Args extends unknown[],
    Retval
  >(
    f: (...args: Args) => Retval
  ) => (...args: Args) => Retval;
}

export const getLogFunction = (log: Log): LogFunction => {
  const logFunction = ((...args: unknown[]) => {
    const [arg1, arg2] = args;
    if (typeof arg1 !== "function" && arg2 === undefined) {
      return (f: (...args: unknown[]) => unknown) =>
        logFunction(arg1 as OptionsOrLabelCaption, f);
    }
    const [optionsOrLabelCaption, f] =
      arg2 === undefined
        ? [undefined, arg1 as (...args: unknown[]) => unknown]
        : [
            arg1 as OptionsOrLabelCaption,
            arg2 as (...args: unknown[]) => unknown,
          ];
    const options: Options | undefined =
      typeof optionsOrLabelCaption === "string"
        ? { labelCaption: optionsOrLabelCaption }
        : optionsOrLabelCaption;
    const filterSet = pipe(options?.filter, (filter) =>
      filter === undefined ? undefined : new Set(filter)
    );
    let callCount = 0;
    let instanceSymbol = getInstanceSymbol();
    return (...args: unknown[]) => {
      pipe(getInstanceSymbol(), (freshInstanceSymbol) => {
        if (freshInstanceSymbol !== instanceSymbol) {
          instanceSymbol = freshInstanceSymbol;
          callCount = 0;
        }
      });
      callCount++;
      const logWithClientLabel = pipe(options?.labelCaption, (labelCaption) =>
        labelCaption === undefined ? log : log.add(label(labelCaption))
      );
      if (filterSet?.has("call") ?? true) {
        logWithClientLabel.add(
          label({ caption: `call ${callCount}`, color: "purple" })
        )(...args);
      }
      const logWithCountLabel = logWithClientLabel.add(
        label({ caption: `${callCount}`, color: "purple" })
      );
      let retval;
      try {
        retval = f(...args);
      } catch (error) {
        if (filterSet?.has("throw") ?? true) {
          logWithCountLabel.add(label({ caption: "throw", color: "red" }))(
            error
          );
        }
        throw error;
      }
      if (filterSet?.has("return") ?? true) {
        if (retval instanceof Promise) {
          logWithCountLabel.add(
            label({ caption: "return promise", color: "yellow" })
          )();
          return getLogPromise(logWithCountLabel)(retval);
        }
        logWithCountLabel.add(label({ caption: "return", color: "green" }))(
          retval
        );
      }
      return retval;
    };
  }) as LogFunction;
  return logFunction;
};
