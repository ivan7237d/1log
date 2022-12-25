import { label, voidLog } from "@1log/core";
import { consolePlugin } from "./consolePlugin";
import { severity } from "./severity";
import { resetTimeDelta } from "./timeDelta";

beforeAll(() => {
  jest.useFakeTimers();
});

afterAll(() => {
  jest.useRealTimers();
});

afterEach(() => {
  resetTimeDelta();
  jest.restoreAllMocks();
});

test("severity levels", () => {
  const calls: string[] = [];
  (["log", "debug", "info", "warn", "error"] as const).forEach((severity) => {
    jest
      .spyOn(console, severity)
      .mockImplementation(() => calls.push(severity));
  });
  const baseLog = voidLog.add(
    consolePlugin({ format: "none", showDelta: false })
  );

  baseLog(1);
  expect(calls).toMatchInlineSnapshot(`
    [
      "log",
    ]
  `);
  calls.length = 0;

  baseLog.add(severity("debug"))();
  expect(calls).toMatchInlineSnapshot(`
    [
      "debug",
    ]
  `);
  calls.length = 0;

  baseLog.add(severity("info"))();
  expect(calls).toMatchInlineSnapshot(`
    [
      "info",
    ]
  `);
  calls.length = 0;

  baseLog.add(severity("warn"))();
  expect(calls).toMatchInlineSnapshot(`
    [
      "warn",
    ]
  `);
  calls.length = 0;

  baseLog.add(severity("error"))();
  expect(calls).toMatchInlineSnapshot(`
    [
      "error",
    ]
  `);
  calls.length = 0;
});

test("css format", () => {
  const spy = jest.spyOn(console, "log").mockImplementation();
  const log = voidLog.add(consolePlugin({ format: "css" }));
  log(1);
  expect(spy.mock.lastCall).toMatchInlineSnapshot(`
    [
      1,
    ]
  `);
  jest.advanceTimersByTime(500);
  log.add(
    label({ caption: "green", color: "green" }),
    label({ caption: "blue" })
  )(1);
  expect(spy.mock.lastCall).toMatchInlineSnapshot(`
    [
      "%cgreen%c %cblue%c %c+500ms%c",
      "color: #16a34a; border: 1px solid currentColor; border-radius: 3px; padding: 0 3px",
      "",
      "color: #2563eb; border: 1px solid currentColor; border-radius: 3px; padding: 0 3px",
      "",
      "font-style: italic",
      "",
      1,
    ]
  `);
});

test("ansi format", () => {
  const log = voidLog.add(
    consolePlugin(),
    label({ caption: "green", color: "green" }),
    label({ caption: "blue" })
  );
  const spy = jest.spyOn(console, "log").mockImplementation();
  log();
  jest.advanceTimersByTime(500);
  log(1);
  expect(spy.mock.lastCall).toMatchInlineSnapshot(`
    [
      "[38;5;35m[green][0m",
      "[38;5;27m[blue][0m",
      "[3m+500ms[0m",
      1,
    ]
  `);
});

test("no format", () => {
  const log = voidLog.add(
    consolePlugin({ format: "none" }),
    label({ caption: "green", color: "green" }),
    label({ caption: "blue" })
  );
  const spy = jest.spyOn(console, "log").mockImplementation();
  log();
  jest.advanceTimersByTime(500);
  log(1);
  expect(spy.mock.lastCall).toMatchInlineSnapshot(`
    [
      "[green]",
      "[blue]",
      "+500ms",
      1,
    ]
  `);
});
