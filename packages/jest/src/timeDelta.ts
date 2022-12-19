import { getInstanceSymbol } from "@1log/core";

let lastTime: number | undefined = undefined;

let instanceSymbol = getInstanceSymbol();

const maybeReset = () => {
  const freshInstanceSymbol = getInstanceSymbol();
  if (freshInstanceSymbol !== instanceSymbol) {
    instanceSymbol = freshInstanceSymbol;
    lastTime = undefined;
  }
};

export const areTimersFake = () =>
  jest.isMockFunction(setTimeout) || (Date as any).isFake === true;

export const getTimeDelta = () => {
  maybeReset();
  if (areTimersFake()) {
    const time = jest.now();
    if (lastTime === undefined) {
      lastTime = time;
    } else {
      const timeDelta = time - lastTime;
      if (timeDelta !== 0) {
        lastTime = time;
        return timeDelta;
      }
    }
  }
};
