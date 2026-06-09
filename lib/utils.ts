import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a duration string (like "14h 30m", "2 hours", "45 min") into minutes.
 * If the string is already a pure number (or numeric string), it returns it as a number.
 */
export function parseDurationToMinutes(durationStr: string | null | undefined): number {
  if (!durationStr) return 0
  const clean = durationStr.trim().toLowerCase()
  if (/^\d+$/.test(clean)) {
    return parseInt(clean, 10)
  }
  let totalMinutes = 0
  const hoursMatch = clean.match(/(\d+(?:\.\d+)?)\s*(?:h|hour|hours)/)
  if (hoursMatch) {
    totalMinutes += parseFloat(hoursMatch[1]) * 60
  }
  const minsMatch = clean.match(/(\d+)\s*(?:m|min|mins|minute|minutes)/)
  if (minsMatch) {
    totalMinutes += parseInt(minsMatch[1], 10)
  }
  if (totalMinutes === 0) {
    const firstNum = clean.match(/^(\d+)/)
    if (firstNum) return parseInt(firstNum[1], 10)
  }
  return totalMinutes || 0
}

/**
 * Formats a duration (which can be a number of minutes, or a string like "120" or "2h 30m")
 * into a standard readable format: "Xh Ym" or "Xh" or "Ym".
 */
export function formatDuration(duration: string | number | null | undefined): string {
  if (duration === null || duration === undefined) return ""
  const mins = typeof duration === "number" ? duration : parseDurationToMinutes(duration)
  if (mins <= 0 || isNaN(mins)) return ""
  
  const h = Math.floor(mins / 60)
  const m = mins % 60
  
  if (h > 0 && m > 0) {
    return `${h}h ${m}m`
  } else if (h > 0) {
    return `${h}h`
  } else {
    return `${m}m`
  }
}

