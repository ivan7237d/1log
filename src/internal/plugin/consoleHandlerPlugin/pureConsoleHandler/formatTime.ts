const extractLargerUnits = (value: number, multiplier: number) => [
  Math.floor(value / multiplier),
  value % multiplier,
];

/**
 * @internal
 */
export const formatTime = (time: number): string => {
  const totalMilliseconds = Math.round(time);
  if (totalMilliseconds < 1000) {
    return `${time.toLocaleString(undefined, {
      maximumSignificantDigits: 3,
    })}ms`;
  }
  const [totalMinutes, milliseconds] = extractLargerUnits(
    totalMilliseconds,
    60 * 1000,
  );
  const resultWithSeconds = `${(milliseconds / 1000).toLocaleString(undefined, {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  })}s`;
  if (totalMinutes === 0) {
    return resultWithSeconds;
  }
  const [totalHours, minutes] = extractLargerUnits(totalMinutes, 60);
  const resultWithMinutes = `${minutes}m ${resultWithSeconds}`;
  if (totalHours === 0) {
    return resultWithMinutes;
  }
  const [totalDays, hours] = extractLargerUnits(totalHours, 24);
  const resultWithHours = `${hours}h ${resultWithMinutes}`;
  if (totalDays === 0) {
    return resultWithHours;
  }
  return `${totalDays.toLocaleString()}d ${resultWithHours}`;
};
