import { label, Log } from "@1log/core";

interface LogPromise {
  <
    Args extends
      | [promise: Promise<unknown>]
      | [labelCaption: string, promise: Promise<unknown>]
      | [labelCaption: string]
  >(
    ...args: Args
  ): Args extends [promise: Promise<infer T>]
    ? Promise<T>
    : Args extends [labelCaption: string, promise: Promise<infer T>]
    ? Promise<T>
    : Args extends [labelCaption: string]
    ? <T>(promise: Promise<T>) => Promise<T>
    : never;
}

export const getLogPromise = (log: Log): LogPromise => {
  const logPromise = ((...args: unknown[]) => {
    const [arg1, arg2] = args;
    if (typeof arg1 === "string" && arg2 === undefined) {
      return (promise: Promise<unknown>) => logPromise(arg1, promise);
    }
    const [labelCaption, promise] =
      arg2 === undefined
        ? [undefined, arg1 as Promise<unknown>]
        : [arg1 as string, arg2 as Promise<unknown>];
    const logWithClientLabel =
      labelCaption !== undefined ? log.add(label(labelCaption)) : log;
    return new Promise<unknown>((resolve, reject) => {
      return promise.then(
        (value) => {
          logWithClientLabel.add(label({ caption: "resolve", color: "green" }))(
            value
          );
          resolve(value);
        },
        (error) => {
          logWithClientLabel.add(label({ caption: "reject", color: "red" }))(
            error
          );
          reject(error);
        }
      );
    });
  }) as LogPromise;
  return logPromise;
};
