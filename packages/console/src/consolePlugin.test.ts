import { label, voidLog } from "@1log/core";
import { consolePlugin, getTimeDelta, resetTimeDelta } from "./consolePlugin";
import { severity } from "./severity";

beforeEach(() => {
  jest.useFakeTimers();
  resetTimeDelta();
});

afterEach(() => {
  jest.useRealTimers();
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

test("getTimeDelta", () => {
  expect(getTimeDelta()).toMatchInlineSnapshot(`undefined`);
  jest.advanceTimersByTime(17);
  expect(getTimeDelta()).toMatchInlineSnapshot(`17`);
  jest.advanceTimersByTime(16);
  expect(getTimeDelta()).toMatchInlineSnapshot(`undefined`);
  jest.advanceTimersByTime(1);
  expect(getTimeDelta()).toMatchInlineSnapshot(`17`);
});

test("css format", () => {
  const log = voidLog.add(
    consolePlugin({ format: "css" }),
    label({ caption: "green", color: "green" }),
    label({ caption: "blue" })
  );
  log();
  jest.advanceTimersByTime(500);
  const spy = jest.spyOn(console, "log");
  log(1);
  expect(spy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "%cgreen%c %cblue%c %c+500%c",
        "background: #16a34a; color: #ffffff; padding: 0 3px",
        "",
        "background: #2563eb; color: #ffffff; padding: 0 3px",
        "",
        "font-style: italic",
        "",
        1,
      ],
    ]
  `);
});

test("ansi format", () => {
  const log = voidLog.add(
    consolePlugin(),
    label({ caption: "green", color: "green" }),
    label({ caption: "blue" })
  );
  log();
  jest.advanceTimersByTime(500);
  const spy = jest.spyOn(console, "log");
  log(1);
  expect(spy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "[38;5;35m[green][0m",
        "[38;5;27m[blue][0m",
        "[3m+500[0m",
        1,
      ],
    ]
  `);
});

test("no format", () => {
  const log = voidLog.add(
    consolePlugin({ format: "none" }),
    label({ caption: "green", color: "green" }),
    label({ caption: "blue" })
  );
  log();
  jest.advanceTimersByTime(500);
  const spy = jest.spyOn(console, "log");
  log(1);
  expect(spy.mock.calls).toMatchInlineSnapshot(`
    [
      [
        "[green]",
        "[blue]",
        "+500",
        1,
      ],
    ]
  `);
});