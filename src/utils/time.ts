/**
 * Utilities for formatting durations and countdown timers.
 */

/**
 * Format total seconds into HH:MM:SS or H:MM:SS.
 * e.g., 3600 -> "1:00:00", 1500 -> "0:25:00", 65 -> "0:01:05"
 */
export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");

  return `${hours}:${paddedMinutes}:${paddedSeconds}`;
}

/**
 * Formats a duration in minutes into readable text (e.g. "25m", "1h", "1h 30m").
 */
export function formatDurationLabel(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hrs = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (rem === 0) {
    return `${hrs}h`;
  }
  return `${hrs}h ${rem}m`;
}
