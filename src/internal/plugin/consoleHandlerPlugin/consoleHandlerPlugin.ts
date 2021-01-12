import { asNever } from 'antiutils';
import { GlobalPlugin, globalPluginSymbol } from '../../logger/plugin';
import { SeverityLevel } from '../../logger/severityLevel';
import { detectedLogStyle } from './detectedLogStyle';
import { pureConsoleHandler } from './pureConsoleHandler/pureConsoleHandler';

/**
 * A plugin that writes log messages to the console.
 */
export const consoleHandlerPlugin: GlobalPlugin = {
  type: globalPluginSymbol,
  handler: pureConsoleHandler({
    getImpureHandler: (severityLevel) =>
      severityLevel === SeverityLevel.debug
        ? console.debug
        : severityLevel === SeverityLevel.info
        ? console.info
        : severityLevel === SeverityLevel.warn
        ? console.warn
        : severityLevel === SeverityLevel.error
        ? console.error
        : severityLevel === undefined
        ? console.log
        : asNever(severityLevel),
    logStyle: detectedLogStyle,
    maxLength: 4000,
  }),
};
