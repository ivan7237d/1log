import { applyPipe, asNever } from 'antiutils';
import { GlobalPlugin, globalPluginSymbol } from '../../logger/plugin';
import { SeverityLevel } from '../../logger/severityLevel';
import { detectedLogStyle } from './detectedLogStyle';
import { pureConsoleHandler } from './pureConsoleHandler/pureConsoleHandler';

// This works around the problem that React overwrites console methods in dev
// mode during test renders, leading to confusing badge numbers.
const consoleSnapshot = applyPipe(
  console,
  ({ debug, info, warn, error, log }) => ({ debug, info, warn, error, log }),
);

/**
 * A plugin that writes log messages to the console.
 */
export const consoleHandlerPlugin: GlobalPlugin = {
  type: globalPluginSymbol,
  handler: pureConsoleHandler({
    getImpureHandler: (severityLevel) =>
      severityLevel === SeverityLevel.debug
        ? consoleSnapshot.debug
        : severityLevel === SeverityLevel.info
        ? consoleSnapshot.info
        : severityLevel === SeverityLevel.warn
        ? consoleSnapshot.warn
        : severityLevel === SeverityLevel.error
        ? consoleSnapshot.error
        : severityLevel === undefined
        ? consoleSnapshot.log
        : asNever(severityLevel),
    logStyle: detectedLogStyle,
    maxLength: 4000,
  }),
};
