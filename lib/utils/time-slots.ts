/**
 * Generates an array of time slots based on start time, end time, and duration.
 * Optionally skips a break period.
 */
export function generateSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number,
  breakEnabled: boolean,
  breakStartTime: string,
  breakDurationMinutes: number
) {
  const slots: { label: string; startTime: string; endTime: string; isBreak: boolean }[] = [];
  
  if (!startTime || !endTime || durationMinutes <= 0) return [];

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const breakStart = breakEnabled ? timeToMinutes(breakStartTime) : -1;
  const breakEnd = breakEnabled ? breakStart + breakDurationMinutes : -1;

  let current = start;
  let periodCount = 1;
  let safetyCounter = 0; // Prevent infinite loops

  while (current < end && safetyCounter < 100) {
    safetyCounter++;
    
    // 1. If we are currently inside the break time
    if (breakEnabled && current >= breakStart && current < breakEnd) {
      slots.push({
        label: "Lunch Break",
        startTime: minutesToTime(breakStart),
        endTime: minutesToTime(breakEnd),
        isBreak: true,
      });
      current = breakEnd;
      continue;
    }

    // 2. If the next period would overlap with the break start
    // We'll jump to the break if the remaining time before break is less than half a period
    // otherwise we continue but the loop will hit case 1 in next iteration
    if (breakEnabled && current < breakStart && (current + durationMinutes) > breakStart) {
        // If there's enough time for another period, we'll hit Case 1 in the next step anyway
        // For simplicity, we just add the break now and move 'current' to breakEnd
        slots.push({
            label: "Lunch Break",
            startTime: minutesToTime(breakStart),
            endTime: minutesToTime(breakEnd),
            isBreak: true,
        });
        current = breakEnd;
        continue;
    }

    // 3. Normal period iteration
    const nextSlotEnd = current + durationMinutes;
    if (nextSlotEnd <= end) {
      slots.push({
        label: `Period ${periodCount++}`,
        startTime: minutesToTime(current),
        endTime: minutesToTime(nextSlotEnd),
        isBreak: false,
      });
      current = nextSlotEnd;
    } else {
      // Cannot fit another full period
      break;
    }
  }

  return slots;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}
