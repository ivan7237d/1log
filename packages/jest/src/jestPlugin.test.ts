import { label, voidLog } from "@1log/core";
import { format } from "pretty-format";
import { jestMessagesSerializer, jestPlugin, readLog } from "./jestPlugin";
import { resetTimeDelta } from "./timeDelta";

afterEach(() => {
  jest.useRealTimers();
  resetTimeDelta();
  readLog();
});

test("empty log", () => {
  const entries = readLog();
  expect([...entries]).toMatchInlineSnapshot(`[]`);
  expect(entries).toMatchInlineSnapshot(`[Empty log]`);
});

test("depth", () => {
  const entries = readLog();
  expect(format([entries], { plugins: [jestMessagesSerializer], maxDepth: 1 }))
    .toMatchInlineSnapshot(`
    "Array [
      [Log],
    ]"
  `);
  expect(format([entries], { plugins: [jestMessagesSerializer], maxDepth: 2 }))
    .toMatchInlineSnapshot(`
    "Array [
      [Empty log],
    ]"
  `);
});

test("empty entry", () => {
  const log = voidLog.add(jestPlugin());
  log();
  const entries = readLog();
  expect([...entries]).toMatchInlineSnapshot(`
    [
      {
        "args": [],
        "labels": [],
      },
    ]
  `);
  expect(entries).toMatchInlineSnapshot(`>`);
  expect(format([entries], { plugins: [jestMessagesSerializer] }))
    .toMatchInlineSnapshot(`
    "Array [
      >,
    ]"
  `);
  expect(
    format([entries], { plugins: [jestMessagesSerializer], min: true })
  ).toMatchInlineSnapshot(`"[>]"`);
});

test("non-empty single-line entry", () => {
  jest.useFakeTimers();
  const log = voidLog.add(jestPlugin());
  log();
  readLog();
  jest.advanceTimersByTime(1000);
  log.add(label("label 1"), label("label 2"))(1, 2);
  const entries = readLog();
  expect([...entries]).toMatchInlineSnapshot(`
    [
      {
        "args": [
          1,
          2,
        ],
        "labels": [
          "label 1",
          "label 2",
        ],
        "timeDelta": 1000,
      },
    ]
  `);
  expect(entries).toMatchInlineSnapshot(`> [label 1] [label 2] +1s 1 2`);
  expect(format([entries], { plugins: [jestMessagesSerializer] }))
    .toMatchInlineSnapshot(`
    "Array [
      > [label 1] [label 2] +1s 1 2,
    ]"
  `);
  expect(
    format([entries], { plugins: [jestMessagesSerializer], min: true })
  ).toMatchInlineSnapshot(`"[> [label 1] [label 2] +1s 1 2]"`);
});

test("multiline entry", () => {
  jest.useFakeTimers();
  const log = voidLog.add(jestPlugin());
  log();
  readLog();
  jest.advanceTimersByTime(1000);
  log.add(label("label 1"), label("label 2"))(1, [2]);
  const entries = readLog();
  expect([...entries]).toMatchInlineSnapshot(`
    [
      {
        "args": [
          1,
          [
            2,
          ],
        ],
        "labels": [
          "label 1",
          "label 2",
        ],
        "timeDelta": 1000,
      },
    ]
  `);
  expect(entries).toMatchInlineSnapshot(`
    >
      [label 1]
      [label 2]
      +1s
      1
      [
        2,
      ]
  `);
  expect(format([entries], { plugins: [jestMessagesSerializer] }))
    .toMatchInlineSnapshot(`
    "Array [
      >
        [label 1]
        [label 2]
        +1s
        1
        Array [
          2,
        ],
    ]"
  `);
  expect(
    format([entries], { plugins: [jestMessagesSerializer], min: true })
  ).toMatchInlineSnapshot(`"[> [label 1] [label 2] +1s 1 [2]]"`);
});

test("multiple entries", () => {
  jest.useFakeTimers();
  const log = voidLog.add(jestPlugin());
  log();
  log();
  const entries = readLog();
  expect([...entries]).toMatchInlineSnapshot(`
    [
      {
        "args": [],
        "labels": [],
      },
      {
        "args": [],
        "labels": [],
      },
    ]
  `);
  expect(entries).toMatchInlineSnapshot(`
    >
    >
  `);
  expect(format([entries], { plugins: [jestMessagesSerializer] }))
    .toMatchInlineSnapshot(`
    "Array [
      >
      >,
    ]"
  `);
  expect(
    format([entries], { plugins: [jestMessagesSerializer], min: true })
  ).toMatchInlineSnapshot(`"[> >]"`);
});

test("readme examples", () => {
  const log = voidLog.add(jestPlugin());
  log(1);
  log(2);
  expect(readLog()).toMatchInlineSnapshot(`
    > 1
    > 2
  `);

  log.add(label("your label"))(1);
  expect(readLog()).toMatchInlineSnapshot(`> [your label] 1`);

  jest.useFakeTimers();
  log(1);
  jest.advanceTimersByTime(500);
  log(2);
  expect(readLog()).toMatchInlineSnapshot(`
    > 1
    > +500ms 2
  `);
});
