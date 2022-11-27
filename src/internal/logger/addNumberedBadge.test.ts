import { badgePlugin } from "../plugin/badgePlugin";
import { getMessages } from "../plugin/mockHandlerPlugin";
import { resetBadgeNumbers } from "./addNumberedBadge";
import { log } from "./logger";

const voidFunction = () => {};

test("incrementing numbers", () => {
  log(badgePlugin("a"))(voidFunction);
  log(badgePlugin("b"))(voidFunction);
  log(badgePlugin("a"))(voidFunction);
  expect(getMessages()).toMatchInlineSnapshot(`
    [a] [create 1] +0ms [Function]
    [b] [create 1] +0ms [Function]
    [a] [create 2] +0ms [Function]
  `);
});

test("resetting numbers", () => {
  log(voidFunction);
  log(voidFunction);
  resetBadgeNumbers();
  log(voidFunction);
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [Function]
    [create 2] +0ms [Function]
    [create 1] +0ms [Function]
  `);
});
