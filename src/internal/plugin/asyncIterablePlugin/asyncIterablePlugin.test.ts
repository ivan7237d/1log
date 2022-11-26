import { setImmediate } from "timers";
import { log } from "../../logger/logger";
import { badgePlugin } from "../badgePlugin";
import { getMessages } from "../mockHandlerPlugin";
import { toAsyncIterable } from "./toAsyncIterable";

const timer = (duration: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, duration);
  });

const autoAdvanceTimers =
  <Result>(callback: () => Promise<Result>) =>
  async () => {
    const promise = callback();
    let resolved = false;
    promise.then(() => {
      resolved = true;
    });
    while (!resolved) {
      await new Promise(setImmediate);
      if (jest.getTimerCount() === 0) {
        break;
      }
      jest.advanceTimersToNextTimer();
    }
    return await promise;
  };

test(
  "basic usage",
  autoAdvanceTimers(async () => {
    async function* asyncIterable() {
      await timer(1000);
      yield 42;
      await timer(1000);
      yield 43;
      await timer(1000);
    }
    for await (const value of log(asyncIterable())) {
      log(value);
      await timer(1000);
    }
    expect(getMessages()).toMatchInlineSnapshot(`
      [create 1] +0ms [AsyncIterableIterator]
      [create 1] [next 1] +0ms
      [create 1] [next 1] [await] +0ms Promise {}
      [create 1] [next 1] [yield] +1.000s 42
      +0ms 42
      [create 1] [next 2] +1.000s
      [create 1] [next 2] [await] +0ms Promise {}
      [create 1] [next 2] [yield] +1.000s 43
      +0ms 43
      [create 1] [next 3] +1.000s
      [create 1] [next 3] [await] +0ms Promise {}
      [create 1] [next 3] [done] +1.000s undefined
    `);
  })
);

test(
  "error",
  autoAdvanceTimers(async () => {
    async function* asyncIterable() {
      yield 42;
      throw 43;
    }
    const promise = (async () => {
      for await (const value of log(asyncIterable())) {
        log(value);
        await timer(1000);
      }
    })();
    await expect(promise).rejects.toMatchInlineSnapshot(`43`);
    expect(getMessages()).toMatchInlineSnapshot(`
      [create 1] +0ms [AsyncIterableIterator]
      [create 1] [next 1] +0ms
      [create 1] [next 1] [await] +0ms Promise {}
      [create 1] [next 1] [yield] +0ms 42
      +0ms 42
      [create 1] [next 2] +1.000s
      [create 1] [next 2] [await] +0ms Promise {}
      [create 1] [next 2] [reject] +0ms 43
    `);
  })
);

test(
  "stack level",
  autoAdvanceTimers(async () => {
    async function* asyncIterable() {
      await timer(1000);
      yield 42;
      await timer(1000);
    }
    for await (const value of log(log(asyncIterable()))) {
      log(value);
      await timer(1000);
    }
    expect(getMessages()).toMatchInlineSnapshot(`
      [create 1] +0ms [AsyncIterableIterator]
      [create 2] +0ms [AsyncIterableIterator]
      [create 2] [next 1] +0ms
      · [create 1] [next 1] +0ms
      · [create 1] [next 1] [await] +0ms Promise {}
      [create 2] [next 1] [await] +0ms Promise {}
      [create 1] [next 1] [yield] +1.000s 42
      [create 2] [next 1] [yield] +0ms 42
      +0ms 42
      [create 2] [next 2] +1.000s
      · [create 1] [next 2] +0ms
      · [create 1] [next 2] [await] +0ms Promise {}
      [create 2] [next 2] [await] +0ms Promise {}
      [create 1] [next 2] [done] +1.000s undefined
      [create 2] [next 2] [done] +0ms undefined
    `);
  })
);

test("argument passed to next and returned value", async () => {
  const generatorFunction = async function* (): AsyncGenerator<
    number,
    number,
    number
  > {
    log(badgePlugin("yield result"))(yield 1);
    return 2;
  };
  const iterator = log(generatorFunction());
  await iterator.next();
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [AsyncIterableIterator]
    [create 1] [next 1] +0ms
    [create 1] [next 1] [await] +0ms Promise {}
    [create 1] [next 1] [yield] +0ms 1
  `);
  await iterator.next(42);
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] [next 2] +0ms 42
    · [yield result] +0ms undefined
    [create 1] [next 2] [await] +0ms Promise {}
    [create 1] [next 2] [done] +0ms 2
  `);
});

test(
  "toAsyncIterable",
  autoAdvanceTimers(async () => {
    async function* asyncIterable() {
      await timer(1000);
      yield 42;
      await timer(1000);
    }
    const nonMatchingIterable = { [Symbol.asyncIterator]: asyncIterable };
    for await (const value of log(nonMatchingIterable)) {
      log(value);
      await timer(1000);
    }
    expect(getMessages()).toMatchInlineSnapshot(`
      +0ms
        {
          Symbol(Symbol.asyncIterator): [Function],
        }
      +1.000s 42
    `);
    for await (const value of log(toAsyncIterable(nonMatchingIterable))) {
      log(value);
      await timer(1000);
    }
    expect(getMessages()).toMatchInlineSnapshot(`
      [create 1] +2.000s [AsyncIterableIterator]
      [create 1] [next 1] +0ms
      [create 1] [next 1] [await] +0ms Promise {}
      [create 1] [next 1] [yield] +1.000s 42
      +0ms 42
      [create 1] [next 2] +1.000s
      [create 1] [next 2] [await] +0ms Promise {}
      [create 1] [next 2] [done] +1.000s undefined
    `);
  })
);
