const extractLargerUnits = (value: number, multiplier: number) =>
  [Math.floor(value / multiplier), value % multiplier] as const;

export const formatDuration = (time: number): string => {
  const totalMilliseconds = Math.round(time);
  if (totalMilliseconds < 1000) {
    return `${time}ms`;
  }
  const [totalMinutes, milliseconds] = extractLargerUnits(
    totalMilliseconds,
    60 * 1000
  );
  const resultWithSeconds = `${milliseconds / 1000}s`;
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
  return `${totalDays}d ${resultWithHours}`;
};
