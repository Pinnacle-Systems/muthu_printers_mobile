export function isWithinWindow(startHour, endHour) {
  const hour = new Date().getHours(); // 0–23, local time
  if (startHour <= endHour) {
    return hour >= startHour && hour < endHour;
  }
  // window wraps past midnight, e.g. 18 → 24 (treated as 18–23 + 0)
  return hour >= startHour || hour < endHour;
}