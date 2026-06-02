/**
 * Pure utility — safe to import in both server and client components.
 * Builds a Google Calendar "Add to Calendar" URL from booking data.
 */

export function buildGoogleCalUrl(data: {
  name: string;
  email: string;
  date: string;    // "YYYY-MM-DD"
  time: string;    // "10:00 AM"
  service: string;
  zoomLink?: string;
}): string {
  /** Convert date + 12-hour time string into "YYYYMMDDTHHMMSS" format */
  function toCalDt(dateStr: string, timeStr: string): string {
    const [year, month, day] = dateStr.split("-");
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return `${year}${month}${day}T090000`;
    let h = parseInt(match[1], 10);
    const m = match[2];
    const ap = match[3].toUpperCase();
    if (ap === "PM" && h !== 12) h += 12;
    if (ap === "AM" && h === 12) h = 0;
    return `${year}${month}${day}T${String(h).padStart(2, "0")}${m}00`;
  }

  const start = toCalDt(data.date, data.time);
  // End = start + 1 hour
  const startH = parseInt(start.slice(9, 11), 10);
  const end = start.slice(0, 9) + String(startH + 1).padStart(2, "0") + start.slice(11);

  const details = [
    `Session: ${data.service}`,
    `Booked by: ${data.name}`,
    data.zoomLink ? `\nZoom Link: ${data.zoomLink}` : "",
  ].filter(Boolean).join("\n");

  const params = new URLSearchParams({
    action:   "TEMPLATE",
    text:     `${data.service} with BrandThink`,
    dates:    `${start}/${end}`,
    details,
    location: data.zoomLink || "Zoom Meeting (link in details)",
    add:      data.email,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
