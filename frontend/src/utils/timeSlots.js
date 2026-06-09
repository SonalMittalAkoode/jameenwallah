/**
 * Generate meeting/tour time slots in 12-hour AM/PM format.
 * 15-minute intervals from 9 AM to 6 PM.
 * @returns {{ value: string; display: string }[]}
 */
export function generateTimeSlots() {
  const slots = [];
  for (let hour = 9; hour <= 18; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      slots.push({ value: timeString, display: displayTime });
    }
  }
  return slots;
}
