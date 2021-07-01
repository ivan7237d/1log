import { LogStyle } from './logStyle';

/**
 * @internal
 */
export const detectedLogStyle: LogStyle = (() => {
  const isNonChromiumEdge =
    typeof navigator !== 'undefined' &&
    typeof navigator?.appVersion === 'string' &&
    (navigator.appVersion.indexOf(' Edge/16.') !== -1 ||
      navigator.appVersion.indexOf(' Edge/17.') !== -1 ||
      navigator.appVersion.indexOf(' Edge/18.') !== -1);

  const isIOs =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.platform) ||
      (navigator.platform === 'MacIntel' &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
        (navigator as any).maxTouchPoints !== undefined &&
        // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/consistent-type-assertions
        (navigator as any).maxTouchPoints > 1));

  const isIOsChrome = isIOs && navigator.userAgent.match('CriOS');

  const isNode =
    typeof process !== 'undefined' &&
    typeof process.versions !== 'undefined' &&
    typeof process.versions.node !== 'undefined';

  return isNonChromiumEdge || isIOsChrome ? 'none' : isNode ? 'ansi' : 'css';
})();
