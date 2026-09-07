export function isWithinWindow(startHour, endHour, startMinute = 0, endMinute = 0) {
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;

  if (startTotalMinutes <= endTotalMinutes) {
    return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes < endTotalMinutes;
  }
  // window wraps past midnight
  return currentTotalMinutes >= startTotalMinutes || currentTotalMinutes < endTotalMinutes;
}