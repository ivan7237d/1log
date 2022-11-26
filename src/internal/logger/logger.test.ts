import { logPalette } from '../logPalette';
import { badgePlugin } from '../plugin/badgePlugin';
import { getMessages } from '../plugin/mockHandlerPlugin';
import { debugPlugin } from '../plugin/severityPlugin/debugPlugin';
import { infoPlugin } from '../plugin/severityPlugin/infoPlugin';
import { resetBadgeNumbers } from './addNumberedBadge';
import { installPlugins, log } from './logger';
import { LogPlugin, pluginSymbol, PluginType, ProxyPlugin } from './plugin';

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
  const result = array.reduce(
    (accumulator: Result | typeof noResult, value) => {
      const result = callback(value);
      if (accumulator !== noResult) {
        expect(accumulator).toEqual(result);
      }
      return result;
    },
    noResult,
  );
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

test('plugins', () => {
  const getMessagesForPlugins = (plugins: LogPlugin[][]) =>
    sameResult(plugins.flatMap(permute), (plugins) => {
      resetBadgeNumbers();
      expect(plugins.reduce((log, plugin) => log(plugin), log)(42)).toEqual(42);
      return getMessages();
    });
  const proxyPlugin: ProxyPlugin = {
    [pluginSymbol]: PluginType.Proxy,
    scope: (value) => value === 42,
    transform: (log) => (value: unknown) => {
      log([{ caption: 'proxy', color: logPalette.green }]);
      return value;
    },
  };
  const plugins = [badgePlugin('a'), proxyPlugin];
  expect(getMessagesForPlugins([plugins])).toMatchInlineSnapshot(`
    [a] [create 1] +0ms 42
    [a] [create 1] [proxy] +0ms
  `);
  const infoPlugins = [plugins, [...plugins, debugPlugin]].map((plugins) => [
    ...plugins,
    infoPlugin,
  ]);
  expect(getMessagesForPlugins(infoPlugins)).toMatchInlineSnapshot(`
    INFO [a] [create 1] +0ms 42
    INFO [a] [create 1] [proxy] +0ms
  `);
});

test('proxy plugin order', () => {
  const log2 = log<[ProxyPlugin]>({
    [pluginSymbol]: PluginType.Proxy,
    scope: (value) => value === 42,
    transform: () => () => 1,
  });
  expect(
    log2<[ProxyPlugin]>({
      [pluginSymbol]: PluginType.Proxy,
      scope: (value) => value === 42,
      transform: () => () => 2,
    })(42),
  ).toEqual(2);
});

test('badge plugin order', () => {
  installPlugins(badgePlugin('a'));
  installPlugins(badgePlugin('b'), badgePlugin('c'));
  log(badgePlugin('d'))(badgePlugin('e'))(42);
  expect(getMessages()).toMatchInlineSnapshot(`[a] [b] [c] [d] [e] +0ms 42`);
});
