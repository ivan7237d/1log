import { pipe } from "antiutils";
import { log } from "../logger/logger";
import { getMessages } from "./mockHandlerPlugin";

test("basic usage", () => {
  const f = log(
    Object.assign(
      (...args: unknown[]) => {
        expect(args).toEqual(["<arg 1>", "<arg 2>"]);
        return "<return value 1>";
      },
      { a: 1 }
    )
  );
  expect(f.a).toMatchInlineSnapshot(`1`);
  f("<arg 1>", "<arg 2>");
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [Function]
    [create 1] [call 1] +0ms "<arg 1>" "<arg 2>"
    [create 1] [call 1] [return] +0ms "<return value 1>"
  `);
  f("<arg 1>", "<arg 2>");
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] [call 2] +0ms "<arg 1>" "<arg 2>"
    [create 1] [call 2] [return] +0ms "<return value 1>"
  `);
});

test("stack level", () => {
  pipe(() => "<return value 1>", log, log)();
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [Function]
    [create 2] +0ms [Function]
    [create 2] [call 1] +0ms
    · [create 1] [call 1] +0ms
    · [create 1] [call 1] [return] +0ms "<return value 1>"
    [create 2] [call 1] [return] +0ms "<return value 1>"
  `);
});

test("async function", async () => {
  // .constructor === AsyncFunction.
  expect(await log(async () => 42)()).toMatchInlineSnapshot(`42`);
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [Function]
    [create 1] [call 1] +0ms
    [create 1] [call 1] [await] +0ms Promise {}
    [create 1] [call 1] [resolve] +0ms 42
  `);

  // Regular function returning a promise.
  expect(
    await log(() =>
      Promise.resolve(42).then((value) => {
        log("promise resolved");
        return value;
      })
    )()
  ).toMatchInlineSnapshot(`42`);
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 2] +0ms [Function]
    [create 2] [call 1] +0ms
    [create 2] [call 1] [await] +0ms Promise {}
    +0ms "promise resolved"
    [create 2] [call 1] [resolve] +0ms 42
  `);

  // Rejection.
  await expect(log(() => Promise.reject(42))()).rejects.toMatchInlineSnapshot(
    `42`
  );
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 3] +0ms [Function]
    [create 3] [call 1] +0ms
    [create 3] [call 1] [await] +0ms Promise {}
    [create 3] [call 1] [reject] +0ms 42
  `);
});
