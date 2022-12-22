import { getInstanceSymbol, label, Log } from "@1log/core";
import { pipe } from "antiutils";
import { Observable } from "rxjs";

interface LogObservable {
  <
    Args extends
      | [source: Observable<unknown>]
      | [labelCaption: string, source: Observable<unknown>]
      | [labelCaption: string]
  >(
    ...args: Args
  ): Args extends [source: Observable<infer T>]
    ? Observable<T>
    : Args extends [labelCaption: string, source: Observable<infer T>]
    ? Observable<T>
    : Args extends [labelCaption: string]
    ? <T>(source: Observable<T>) => Observable<T>
    : never;
}

export const getLogObservable = (log: Log): LogObservable => {
  const logObservable = ((...args: unknown[]) => {
    const [arg1, arg2] = args;
    if (typeof arg1 === "string" && arg2 === undefined) {
      return (source: Observable<unknown>) => logObservable(arg1, source);
    }
    const [labelCaption, source] =
      arg2 === undefined
        ? [undefined, arg1 as Observable<unknown>]
        : [arg1 as string, arg2 as Observable<unknown>];
    const logWithClientLabel =
      labelCaption === undefined ? log : log.add(label(labelCaption));
    let subscribeCount = 0;
    let subscribeInstanceSymbol = getInstanceSymbol();
    return new Observable((subscriber) => {
      pipe(getInstanceSymbol(), (freshInstanceSymbol) => {
        if (freshInstanceSymbol !== subscribeInstanceSymbol) {
          subscribeInstanceSymbol = freshInstanceSymbol;
          subscribeCount = 0;
        }
      });
      subscribeCount++;
      logWithClientLabel.add(
        label({ caption: `subscribe ${subscribeCount}`, color: "purple" })
      )();
      const logWithSubscribeCountLabel = logWithClientLabel.add(
        label({ caption: `${subscribeCount}`, color: "purple" })
      );
      let nextCount = 0;
      const subscription = source.subscribe({
        next: (value) => {
          nextCount++;
          logWithSubscribeCountLabel.add(
            label({ caption: `next ${nextCount}`, color: "green" })
          )(value);
          subscriber.next(value);
        },
        error: (error) => {
          logWithSubscribeCountLabel.add(
            label({ caption: `error`, color: "red" })
          )(error);
          subscriber.error(error);
        },
        complete: () => {
          logWithSubscribeCountLabel.add(
            label({ caption: `complete`, color: "yellow" })
          )();
          subscriber.complete();
        },
      });
      return () => {
        logWithSubscribeCountLabel.add(
          label({ caption: `unsubscribe`, color: "orange" })
        )();
        subscription.unsubscribe();
      };
    });
  }) as LogObservable;
  return logObservable;
};
