import { LogMessage } from '../logger/handler';
import { GlobalPlugin, globalPluginSymbol } from '../logger/plugin';

let messages: LogMessage[] = [];

const returnedMessageArrays = new WeakSet();

/**
 * A plugin that buffers log messages in memory.
 */
export const mockHandlerPlugin: GlobalPlugin = {
  type: globalPluginSymbol,
  handler: (logRecord) => {
    messages = [...messages, logRecord];
  },
};

/**
 * Returns buffered log messages and clears the buffer.
 */
export const getMessages = (): LogMessage[] => {
  try {
    returnedMessageArrays.add(messages);
    return messages;
  } finally {
    messages = [];
  }
};

/**
 * Checks whether the value is one returned by `getMessages`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isMessages = (value: any): boolean =>
  returnedMessageArrays.has(value);
