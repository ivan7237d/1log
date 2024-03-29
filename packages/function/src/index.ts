import { getInstanceSymbol, label, Log } from "@1log/core";
import { getLogPromise } from "@1log/promise";
import { pipe } from "pipe-function";

export interface LogFunction {
  <
    Args extends
      | [f: (...args: any) => any]
      | [labelCaption: string, f: (...args: any) => any]
      | [labelCaption: string]
  >(
    ...args: Args
  ): Args extends [f: (...args: infer FArgs) => infer Retval]
    ? (...args: FArgs) => Retval
    : Args extends [
        labelCaption: string,
        f: (...args: infer FArgs) => infer Retval
      ]
    ? (...args: FArgs) => Retval
    : Args extends [labelCaption: string]
    ? <FArgs extends unknown[], Retval>(
        f: (...args: FArgs) => Retval
      ) => (...args: FArgs) => Retval
    : never;
}

export const getLogFunction = (log: Log): LogFunction => {
  const logFunction = ((...args: unknown[]) => {
    const [arg1, arg2] = args;
    if (typeof arg1 === "string" && arg2 === undefined) {
      return (f: (...args: unknown[]) => unknown) => logFunction(arg1, f);
    }
    const [labelCaption, f] =
      arg2 === undefined
        ? [undefined, arg1 as (...args: unknown[]) => unknown]
        : [arg1 as string, arg2 as (...args: unknown[]) => unknown];
    const logWithClientLabel =
      labelCaption === undefined ? log : log.add(label(labelCaption));
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
      logWithClientLabel.add(
        label({ caption: `call ${callCount}`, color: "green" })
      )(...args);
      const logWithCountLabel = logWithClientLabel.add(
        label({ caption: `${callCount}`, color: "green" })
      );
      let retval;
      try {
        retval = f(...args);
      } catch (error) {
        logWithCountLabel.add(label({ caption: "throw", color: "red" }))(error);
        throw error;
      }
      if (retval instanceof Promise) {
        logWithCountLabel.add(
          label({ caption: "return promise", color: "yellow" })
        )();
        return getLogPromise(logWithCountLabel)(retval);
      }
      logWithCountLabel.add(label({ caption: "return", color: "violet" }))(
        retval
      );
      return retval;
    };
  }) as LogFunction;
  return logFunction;
};
