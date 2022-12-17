let lastTime: number | undefined = undefined;

export const areTimersFake = () =>
  jest.isMockFunction(setTimeout) || (Date as any).isFake === true;

export const getTimeDelta = () => {
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

export const resetTimeDelta = () => {
  lastTime = undefined;
};
