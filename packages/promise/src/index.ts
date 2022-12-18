import { label, Log } from "@1log/core";

interface LogPromise {
  <T>(labelCaption: string, value: Promise<T>): Promise<T>;
  <T>(value: Promise<T>): Promise<T>;
  (labelCaption: string): <T>(value: Promise<T>) => Promise<T>;
}

export const getLogPromise = (log: Log): LogPromise => {
  const logPromise = ((...args: unknown[]) => {
    const [arg1, arg2] = args;
    if (typeof arg1 === "string" && arg2 === undefined) {
      return (value: Promise<unknown>) => logPromise(arg1, value);
    }
    const [labelCaption, promise] =
      arg2 === undefined
        ? [undefined, arg1 as Promise<unknown>]
        : [arg1 as string, arg2 as Promise<unknown>];
    return new Promise<unknown>((resolve, reject) => {
      const logWithClientLabel =
        labelCaption !== undefined ? log.add(label(labelCaption)) : log;
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
