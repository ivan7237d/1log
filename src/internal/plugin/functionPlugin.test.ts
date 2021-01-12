import { applyPipe } from 'antiutils';
import { log } from '../logger/logger';
import { getMessages } from './mockHandlerPlugin';

test('basic usage', () => {
  applyPipe(jest.fn().mockReturnValue('<return value 1>'), log)(
    '<arg 1>',
    '<arg 2>',
  );
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms
      [MockFunction] {
        "calls": Array [
          Array [
            "<arg 1>",
            "<arg 2>",
          ],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": "<return value 1>",
          },
        ],
      }
    [create 1] [call] +0ms "<arg 1>" "<arg 2>"
    [create 1] [return] +0ms "<return value 1>"
  `);
});

test('stack level', () => {
  applyPipe(jest.fn().mockReturnValue('<return value 1>'), log, log)();
  expect(getMessages()).toMatchInlineSnapshot(`
    [create 1] +0ms
      [MockFunction] {
        "calls": Array [
          Array [],
        ],
        "results": Array [
          Object {
            "type": "return",
            "value": "<return value 1>",
          },
        ],
      }
    [create 2] +0ms [Function]
    [create 2] [call] +0ms
    · [create 1] [call] +0ms
    · [create 1] [return] +0ms "<return value 1>"
    [create 2] [return] +0ms "<return value 1>"
  `);
});
