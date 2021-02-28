import { pipe } from 'antiutils';
import { log } from '../logger/logger';
import { getMessages } from './mockHandlerPlugin';

test('basic usage', () => {
  const f = log(
    Object.assign(
      (...args: unknown[]) => {
        expect(args).toMatchInlineSnapshot(`
                  Array [
                    "<arg 1>",
                    "<arg 2>",
                  ]
              `);
        return '<return value 1>';
      },
      { a: 1 },
    ),
  );
  expect(f.a).toMatchInlineSnapshot(`1`);
  f('<arg 1>', '<arg 2>');
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [Function]
    [create 1] [call 1] +0ms "<arg 1>" "<arg 2>"
    [create 1] [call 1] [return] +0ms "<return value 1>"
  `);
  f('<arg 1>', '<arg 2>');
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] [call 2] +0ms "<arg 1>" "<arg 2>"
    [create 1] [call 2] [return] +0ms "<return value 1>"
  `);
});

test('stack level', () => {
  pipe(() => '<return value 1>', log, log)();
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms [Function]
    [create 2] +0ms [Function]
    [create 2] [call 1] +0ms
    · [create 1] [call 1] +0ms
    · [create 1] [call 1] [return] +0ms "<return value 1>"
    [create 2] [call 1] [return] +0ms "<return value 1>"
  `);
});
