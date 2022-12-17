let lastTime: number | undefined = undefined;

export const getTimeDelta = () => {
  const time = Date.now();
  if (lastTime === undefined) {
    lastTime = time;
  } else {
    const timeDelta = time - lastTime;
    lastTime = time;
    if (timeDelta * 60 >= 1000) {
      return timeDelta;
    }
  }
};

export const resetTimeDelta = () => {
  lastTime = undefined;
};
