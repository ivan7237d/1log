import { logPalette } from '../logPalette';
import { iterablePlugin } from '../plugin/iterablePlugin';
import { getMessages } from '../plugin/mockHandlerPlugin';
import { addNumberedBadge, resetBadgeNumbers } from './addNumberedBadge';
import { log } from './logger';
import { ClosingPlugin, closingPluginSymbol } from './plugin';

test('incrementing numbers', () => {
  const plugin: ClosingPlugin<(arg: number) => number> = {
    type: closingPluginSymbol,
    transform: (log) => (value: number) => {
      addNumberedBadge('a', logPalette.green)(log)([]);
      addNumberedBadge('a', logPalette.green)(log)([]);
      addNumberedBadge('b', logPalette.green)(log)([]);
      return value;
    },
  };
  log(plugin)(42);
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms 42
    [create 1] [a 1] +0ms
    [create 1] [a 2] +0ms
    [create 1] [b 1] +0ms
  `);
  log(plugin)(42);
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 2] +0ms 42
    [create 2] [a 1] +0ms
    [create 2] [a 2] +0ms
    [create 2] [b 1] +0ms
  `);
});

test('resetting numbers', () => {
  log(() => {});
  log(() => {});
  resetBadgeNumbers();
  log(() => {});
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [Function]
    [create 2] +0ms [Function]
    [create 1] +0ms [Function]
  `);

  const iterable = log(iterablePlugin)([1, 2]);
  iterable[Symbol.iterator]();
  iterable[Symbol.iterator]();
  resetBadgeNumbers();
  iterable[Symbol.iterator]();
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 2] +0ms
      Array [
        1,
        2,
      ]
    [create 2] [call 1] +0ms
    [create 2] [call 2] +0ms
    [create 2] [call 1] +0ms
  `);
});
