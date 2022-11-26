import { LogMessage } from "../logger/handler";
import { HandlerPlugin, pluginSymbol, PluginType } from "../logger/plugin";

let messages: LogMessage[] = [];

const returnedMessageArrays = new WeakSet();

/**
 * A plugin that buffers log messages in memory. Can optionally be passed a
 * predicate to mute messages for which it returns false.
 */
export const mockHandlerPlugin = (
  filter?: (message: LogMessage) => boolean
): HandlerPlugin => ({
  [pluginSymbol]: PluginType.Handler,
  handler: (message) => {
    if (filter === undefined || filter(message)) {
      messages = [...messages, message];
    }
  },
});

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
