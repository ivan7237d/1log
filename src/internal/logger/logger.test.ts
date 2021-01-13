import { applyPipe, as, deepEqual, flatMapIterable } from 'antiutils';
import { badgePlugin } from '../plugin/badgePlugin';
import { disablePlugin } from '../plugin/disablePlugin';
import { iterablePlugin } from '../plugin/iterablePlugin';
import { getMessages } from '../plugin/mockHandlerPlugin';
import { debugPlugin } from '../plugin/severityPlugin/debugPlugin';
import { infoPlugin } from '../plugin/severityPlugin/infoPlugin';
import { installPlugin, log } from './logger';
import { globalPluginSymbol, UniversalPlugin } from './plugin';
import { SeverityLevel } from './severityLevel';

/**
 * Returns all permutations.
 */
const permute = <T>(array: T[]) => {
  const length = array.length,
    result = [array.slice()],
    c = new Array(length).fill(0);
  let i = 1,
    k,
    p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = array[i];
      array[i] = array[k];
      array[k] = p;
      ++c[i];
      i = 1;
      result.push(array.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
};

/**
 * If the callback returns the same (by deep equal check) value for all values
 * in an array, returns that result, otherwise fails the test.
 */
const sameResult = <Element, Result>(
  array: Element[],
  callback: (array: Element) => Result,
) => {
  const noResult = Symbol();
  const result = array.reduce((accumulator, value) => {
    const result = callback(value);
    if (accumulator !== noResult) {
      if (!deepEqual(accumulator, result)) {
        fail([value, accumulator, result]);
      }
    }
    return result;
  }, as<Result | typeof noResult>(noResult));
  if (result === noResult) {
    fail();
  }
  return result;
};

test('usage with number of arguments other than 1', () => {
  expect(log()).toBeUndefined();
  expect(getMessages()).toMatchInlineSnapshot(`+0ms`);
  expect(log(1, 2)).toBeUndefined();
  expect(getMessages()).toMatchInlineSnapshot(`+0ms 1 2`);
  expect(log(badgePlugin('<caption>'))()).toBeUndefined();
  expect(getMessages()).toMatchInlineSnapshot(`[<caption>] +0ms`);
  expect(log(badgePlugin('<caption>'))(1, 2)).toBeUndefined();
  expect(getMessages()).toMatchInlineSnapshot(`[<caption>] +0ms 1 2`);
});

test('universal plugin installation', () => {
  const logWithBadge = log(badgePlugin('b'));
  const uninstall = installPlugin(badgePlugin('a'));
  try {
    logWithBadge(42);
    expect(getMessages()).toMatchInlineSnapshot(`[a] [b] +0ms 42`);
  } finally {
    uninstall();
  }
  logWithBadge(42);
  expect(getMessages()).toMatchInlineSnapshot(`[b] +0ms 42`);
});

test('proxy global plugin installation', () => {
  const uninstall = installPlugin({
    type: globalPluginSymbol,
    proxy: {
      scope: () => true,
      transform: () => (value: number) => value + 1,
    },
  });
  try {
    expect(log(42)).toEqual(43);
  } finally {
    uninstall();
  }
  expect(log(42)).toEqual(42);
});

test('handler global plugin installation', () => {
  const handler = jest.fn();
  const uninstall = installPlugin({
    type: globalPluginSymbol,
    handler: handler,
  });
  try {
    log(42);
  } finally {
    uninstall();
  }
  expect(getMessages()).toMatchInlineSnapshot(`+0ms 42`);
  expect(handler.mock.calls).toMatchInlineSnapshot(`
    Array [
      Array [
        Object {
          "badges": Array [],
          "data": Array [
            42,
          ],
          "severityLevel": undefined,
          "stackLevel": 0,
          "timeDelta": 0,
        },
      ],
    ]
  `);
  handler.mockClear();
  log(43);
  expect(getMessages()).toMatchInlineSnapshot(`+0ms 43`);
  expect(handler.mock.calls).toMatchInlineSnapshot(`Array []`);
});

test('badge plugin order', () => {
  const uninstall1 = installPlugin(badgePlugin('a'));
  try {
    const uninstall2 = installPlugin(badgePlugin('b'));
    try {
      expect(log(badgePlugin('c'))(badgePlugin('d'))(42)).toEqual(42);
      expect(getMessages()).toMatchInlineSnapshot(`[a] [b] [c] [d] +0ms 42`);
    } finally {
      uninstall2();
    }
  } finally {
    uninstall1();
  }
});

test('disabling logging', () => {
  const getMessagesForPlugins = (plugins: UniversalPlugin[][]) =>
    sameResult(
      [
        ...applyPipe(
          plugins,
          flatMapIterable((value) => permute(value)),
        ),
      ],
      (plugins) => {
        expect(plugins.reduce((log, plugin) => log(plugin), log)(42)).toEqual(
          42,
        );
        return getMessages();
      },
    );
  const plugins = applyPipe(badgePlugin('a'), (plugin) => [
    [plugin],
    [plugin, disablePlugin(true)],
  ]);
  expect(getMessagesForPlugins(plugins)).toMatchInlineSnapshot(`[a] +0ms 42`);
  const infoPlugins = [
    ...plugins,
    ...plugins.map((plugins) => [...plugins, debugPlugin]),
  ].map((plugins) => [...plugins, infoPlugin]);
  expect(getMessagesForPlugins(infoPlugins)).toMatchInlineSnapshot(
    `INFO [a] +0ms 42`,
  );
  expect(
    getMessagesForPlugins([
      ...plugins.map((plugins) => [...plugins, disablePlugin(false)]),
      ...applyPipe(
        [...plugins, ...infoPlugins].map((plugins) => [
          ...plugins,
          disablePlugin(SeverityLevel.warn),
        ]),
        (plugins) => [
          ...plugins,
          ...plugins.map((plugins) => [...plugins, disablePlugin(false)]),
        ],
      ),
    ]),
  ).toMatchInlineSnapshot(`[No log messages]`);
});

test('"create" badge', () => {
  log(badgePlugin('a'))(() => {});
  log(badgePlugin('a'))(iterablePlugin)([]);
  expect(getMessages()).toMatchInlineSnapshot(`
      [a] [create 1] +0ms [Function]
      [a] [create 2] +0ms Array []
    `);
});

test('independent stack levels for each severity level', () => {
  applyPipe(
    (_arg: string) => '<return value 1>',
    log(badgePlugin('l1')),
    log(debugPlugin)(badgePlugin('d1')),
    log(debugPlugin)(badgePlugin('d2')),
    log(badgePlugin('l2')),
    log(badgePlugin('l3')),
  )('<arg>');
  expect(getMessages()).toMatchInlineSnapshot(`
    [l1] [create 1] +0ms [Function]
    DEBUG [d1] [create 1] +0ms [Function]
    DEBUG [d2] [create 1] +0ms [Function]
    [l2] [create 1] +0ms [Function]
    [l3] [create 1] +0ms [Function]
    [l3] [create 1] [call] +0ms "<arg>"
    · [l2] [create 1] [call] +0ms "<arg>"
    DEBUG [d2] [create 1] [call] +0ms "<arg>"
    DEBUG · [d1] [create 1] [call] +0ms "<arg>"
    · · [l1] [create 1] [call] +0ms "<arg>"
    · · [l1] [create 1] [return] +0ms "<return value 1>"
    DEBUG · [d1] [create 1] [return] +0ms "<return value 1>"
    DEBUG [d2] [create 1] [return] +0ms "<return value 1>"
    · [l2] [create 1] [return] +0ms "<return value 1>"
    [l3] [create 1] [return] +0ms "<return value 1>"
  `);
});
