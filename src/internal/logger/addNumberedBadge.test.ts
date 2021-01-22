import { badgePlugin } from '../plugin/badgePlugin';
import { getMessages } from '../plugin/mockHandlerPlugin';
import { resetBadgeNumbers } from './addNumberedBadge';
import { log } from './logger';

test('incrementing numbers', () => {
  log(badgePlugin('a'))(() => {});
  log(badgePlugin('b'))(() => {});
  log(badgePlugin('a'))(() => {});
  expect(getMessages()).toMatchInlineSnapshot(`
    [a] [create 1] +0ms [Function]
    [b] [create 1] +0ms [Function]
    [a] [create 2] +0ms [Function]
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
});
