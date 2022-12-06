import { log } from "./logger/logger";
import { getMessages } from "./plugin/mockHandlerPlugin";
import { debugPlugin } from "./plugin/severityPlugin/debugPlugin";
import { errorPlugin } from "./plugin/severityPlugin/errorPlugin";
import { infoPlugin } from "./plugin/severityPlugin/infoPlugin";
import { warnPlugin } from "./plugin/severityPlugin/warnPlugin";

test("severity levels", () => {
  log(debugPlugin)();
  log(warnPlugin)();
  log(infoPlugin)();
  log(errorPlugin)();
  expect(getMessages()).toMatchInlineSnapshot(`
    DEBUG +0ms
    WARNING +0ms
    INFO +0ms
    ERROR +0ms
  `);
});

test("data with newlines", () => {
  log({ a: 1 });
  expect(getMessages()).toMatchInlineSnapshot(`
    +0ms
      {
        "a": 1,
      }
  `);
});

test("messages nested in other objects", () => {
  log();
  expect([getMessages()]).toMatchInlineSnapshot(`
    [
      [Log messages],
    ]
  `);
});
