import { noopLog, resetLog } from "@1log/core";
import { jestPlugin, readLog } from "@1log/jest";
import { EMPTY, of, throwError, timer } from "rxjs";
import { getLogObservable } from ".";

const log = noopLog.add(jestPlugin());
const logObservable = getLogObservable(log);

afterEach(() => {
  jest.useRealTimers();
  resetLog();
});

test("both args, subscribe, next, complete, unsubscribe", () => {
  // $ExpectType Observable<number>
  const observable = logObservable("client", of(1, 2));
  observable.subscribe();
  observable.subscribe();
  expect(readLog()).toMatchInlineSnapshot(`
    > [client] [subscribe 1]
    > [client] [1] [next 1] 1
    > [client] [1] [next 2] 2
    > [client] [1] [complete]
    > [client] [1] [unsubscribe]
    > [client] [subscribe 2]
    > [client] [2] [next 1] 1
    > [client] [2] [next 2] 2
    > [client] [2] [complete]
    > [client] [2] [unsubscribe]
  `);
});

test("only observable as arg", () => {
  // $ExpectType Observable<never>
  const observable1 = logObservable(EMPTY);
  observable1.subscribe();
  expect(readLog()).toMatchInlineSnapshot(`
    > [subscribe 1]
    > [1] [complete]
    > [1] [unsubscribe]
  `);
  // $ExpectType Observable<never>
  const observable2 = EMPTY.pipe(logObservable);
  observable2.subscribe();
  expect(readLog()).toMatchInlineSnapshot(`
    > [subscribe 1]
    > [1] [complete]
    > [1] [unsubscribe]
  `);
});

test("only label as arg", () => {
  // $ExpectType Observable<never>
  const observable1 = logObservable("client")(EMPTY);
  observable1.subscribe();
  expect(readLog()).toMatchInlineSnapshot(`
    > [client] [subscribe 1]
    > [client] [1] [complete]
    > [client] [1] [unsubscribe]
  `);
  // $ExpectType Observable<never>
  const observable2 = EMPTY.pipe(logObservable("client"));
  observable2.subscribe();
  expect(readLog()).toMatchInlineSnapshot(`
    > [client] [subscribe 1]
    > [client] [1] [complete]
    > [client] [1] [unsubscribe]
  `);
});

test("error", () => {
  const observable = throwError(() => new Error("a")).pipe(logObservable);
  observable.subscribe({ error: (error) => log("error caught", error) });
  expect(readLog()).toMatchInlineSnapshot(`
    > [subscribe 1]
    > [1] [error] [Error: a]
    > "error caught" [Error: a]
    > [1] [unsubscribe]
  `);
});

test("time delta", () => {
  jest.useFakeTimers();
  const observable = timer(500).pipe(logObservable);
  observable.subscribe();
  jest.runAllTimers();
  expect(readLog()).toMatchInlineSnapshot(`
    > [subscribe 1]
    > [1] [next 1] +500ms 0
    > [1] [complete]
    > [1] [unsubscribe]
  `);
});

test("examples in readme", async () => {
  const observable1 = of("a", "b").pipe(logObservable);
  observable1.subscribe();
  expect(readLog()).toMatchInlineSnapshot(`
    > [subscribe 1]
    > [1] [next 1] "a"
    > [1] [next 2] "b"
    > [1] [complete]
    > [1] [unsubscribe]
  `);

  const observable2 = of("a").pipe(logObservable("your label"));
  observable2.subscribe();
  expect(readLog()).toMatchInlineSnapshot(`
    > [your label] [subscribe 1]
    > [your label] [1] [next 1] "a"
    > [your label] [1] [complete]
    > [your label] [1] [unsubscribe]
  `);

  const observable3 = logObservable("your label", of("a"));
  observable3.subscribe();
  expect(readLog()).toMatchInlineSnapshot(`
    > [your label] [subscribe 1]
    > [your label] [1] [next 1] "a"
    > [your label] [1] [complete]
    > [your label] [1] [unsubscribe]
  `);
});
